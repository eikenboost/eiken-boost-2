import { NextResponse } from "next/server";
import { env, hasStripeEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  if (!hasStripeEnv) {
    return NextResponse.json({ url: `${env.appUrl}/app/settings?portal=demo` });
  }

  // Hook point: look up the signed-in user's Stripe customer ID from Supabase.
  const customerId = "";
  if (!customerId) {
    return NextResponse.json({ url: `${env.appUrl}/app/paywall` });
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.appUrl}/app/settings`,
  });

  return NextResponse.json({ url: session.url });
}
