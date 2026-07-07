import Stripe from "stripe";
import { env } from "@/lib/env";

export function getStripe() {
  if (!env.stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(env.stripeSecretKey, {
    apiVersion: "2026-06-24.dahlia",
  });
}
