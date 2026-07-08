import Stripe from "stripe";
import { env } from "@/lib/env";

export function getStripe() {
  if (!env.stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(env.stripeSecretKey, {
    apiVersion: "2026-06-24.dahlia",
    // Cloudflare Workers (edge runtime) does not support Node's default
    // `https` based HTTP client used by the Stripe SDK — requests hang
    // indefinitely. Use the fetch-based client instead, which works in
    // both Node.js and Workers/edge runtimes.
    httpClient: Stripe.createFetchHttpClient(),
  });
}
