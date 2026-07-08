import { NextResponse } from "next/server";
import { env, hasStripeEnv, hasSupabaseEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const mapPriceId = (kind: string) => {
  switch (kind) {
    case "pro_monthly":
      return { mode: "subscription", price: env.stripePriceMonthly };
    case "pro_annual":
      return { mode: "subscription", price: env.stripePriceAnnual };
    case "writing_pack_5":
      return { mode: "payment", price: env.stripeWritingPack };
    case "speaking_pack_5":
      return { mode: "payment", price: env.stripeSpeakingPack };
    default:
      return { mode: "subscription", price: env.stripePriceMonthly };
  }
};

export async function POST(request: Request) {
  const { kind } = await request.json();
  const { mode, price } = mapPriceId(kind);

  if (!hasStripeEnv || !price) {
    return NextResponse.json({ url: `${env.appUrl}/app/paywall?demoCheckout=1&selected=${kind}` });
  }

  // Real Stripe checkout requires knowing *who* is paying, so the webhook can
  // later credit the right account. If Supabase auth isn't configured, fall
  // back to the demo flow rather than creating an orphaned Stripe session.
  if (!hasSupabaseEnv) {
    return NextResponse.json({ url: `${env.appUrl}/app/paywall?demoCheckout=1&selected=${kind}` });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  if (!user) {
    // Not signed in — send them to log in first instead of starting a
    // checkout session with no owner attached to it.
    return NextResponse.json({ url: `${env.appUrl}/login?next=/app/paywall` });
  }

  // Reuse an existing Stripe customer for this user if we already have one,
  // so repeat purchases and the billing portal share one Stripe customer.
  const admin = createSupabaseAdminClient();
  const { data: existingSub } = admin
    ? await admin
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .not("stripe_customer_id", "is", null)
        .limit(1)
        .maybeSingle()
    : { data: null };

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: mode as "payment" | "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${env.appUrl}/app/paywall?checkout=success`,
    cancel_url: `${env.appUrl}/app/paywall?checkout=cancelled`,
    allow_promotion_codes: true,
    client_reference_id: user.id,
    customer: existingSub?.stripe_customer_id ?? undefined,
    customer_email: existingSub?.stripe_customer_id ? undefined : (user.email ?? undefined),
    metadata: { supabase_user_id: user.id, kind },
    subscription_data: mode === "subscription" ? { metadata: { supabase_user_id: user.id, kind } } : undefined,
    payment_intent_data: mode === "payment" ? { metadata: { supabase_user_id: user.id, kind } } : undefined,
  });

  return NextResponse.json({ url: session.url });
}
