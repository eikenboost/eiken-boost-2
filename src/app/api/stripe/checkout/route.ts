import { NextResponse } from "next/server";
import { env, hasStripeEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

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

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: mode as "payment" | "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${env.appUrl}/app/paywall?checkout=success`,
    cancel_url: `${env.appUrl}/app/paywall?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
