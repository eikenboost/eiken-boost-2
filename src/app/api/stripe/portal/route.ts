import { NextResponse } from "next/server";
import { env, hasStripeEnv, hasSupabaseEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  if (!hasStripeEnv || !hasSupabaseEnv) {
    return NextResponse.json({ url: `${env.appUrl}/app/settings?portal=demo` });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  if (!user) {
    return NextResponse.json({ url: `${env.appUrl}/login?next=/app/settings` });
  }

  const admin = createSupabaseAdminClient();
  const { data: subscription } = admin
    ? await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle()
    : { data: null };

  const customerId = subscription?.stripe_customer_id;
  if (!customerId) {
    // No Stripe customer yet (never purchased) — send them to buy a plan first.
    return NextResponse.json({ url: `${env.appUrl}/app/paywall` });
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.appUrl}/app/settings`,
  });

  return NextResponse.json({ url: session.url });
}
