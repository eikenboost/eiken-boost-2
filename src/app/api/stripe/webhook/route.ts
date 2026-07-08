import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { env, hasStripeEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { creditPackForPrice, planIdForPrice } from "@/lib/stripe-plan-map";
import type { PlanId } from "@/lib/types";

const CREDIT_PACK_AMOUNT = 5;

/** Upsert the subscriptions row for a user from a Stripe Subscription object. */
async function syncSubscription(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  userId: string,
  subscription: Stripe.Subscription,
) {
  const priceId = subscription.items.data[0]?.price.id;
  const planId: PlanId = planIdForPrice(priceId) ?? "free";
  const currentPeriodEndUnix = subscription.items.data[0]?.current_period_end;

  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_id: planId,
      stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

/** Add `amount` credits of `creditType` to a user's balance (read-then-write; webhook events for the same user are delivered sequentially by Stripe). */
async function addCredits(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  userId: string,
  creditType: "writing" | "speaking",
  amount: number,
) {
  const { data: existing } = await admin
    .from("credit_balances")
    .select("balance")
    .eq("user_id", userId)
    .eq("credit_type", creditType)
    .maybeSingle();

  await admin.from("credit_balances").upsert(
    {
      user_id: userId,
      credit_type: creditType,
      balance: (existing?.balance ?? 0) + amount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,credit_type" },
  );
}

export async function POST(request: Request) {
  if (!hasStripeEnv || !env.stripeWebhookSecret) {
    return NextResponse.json({ received: true, mode: "demo" });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, env.stripeWebhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    // Supabase isn't configured — acknowledge the event so Stripe doesn't
    // retry forever, but there is nothing to sync.
    return NextResponse.json({ received: true, mode: "no-db" });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;
      if (!userId) break;

      if (session.mode === "subscription" && typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await syncSubscription(admin, userId, subscription);
      } else if (session.mode === "payment") {
        // One-off credit pack purchase — figure out which pack from the line
        // item price (metadata.kind is also set as a fallback/cross-check).
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const priceId = lineItems.data[0]?.price?.id;
        const pack = creditPackForPrice(priceId) ?? (session.metadata?.kind as "writing_pack_5" | "speaking_pack_5" | undefined);
        if (pack === "writing_pack_5") await addCredits(admin, userId, "writing", CREDIT_PACK_AMOUNT);
        if (pack === "speaking_pack_5") await addCredits(admin, userId, "speaking", CREDIT_PACK_AMOUNT);
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : invoice.parent?.subscription_details?.subscription?.id;
      if (!subscriptionId) break;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.supabase_user_id;
      if (!userId) break;

      await syncSubscription(admin, userId, subscription);
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      if (!userId) break;

      if (event.type === "customer.subscription.deleted") {
        await admin.from("subscriptions").upsert(
          {
            user_id: userId,
            plan_id: "free",
            stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
            stripe_subscription_id: subscription.id,
            status: "canceled",
            current_period_end: null,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      } else {
        await syncSubscription(admin, userId, subscription);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
