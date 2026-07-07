import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { env, hasStripeEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

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
  const event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret);

  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.paid":
    case "customer.subscription.updated":
      // Hook point: sync subscriptions / credit balances to Supabase.
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
