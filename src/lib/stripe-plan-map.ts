import { env } from "@/lib/env";
import type { PlanId } from "@/lib/types";

/**
 * Server-only helper mapping a Stripe Price ID back to our internal plan id.
 * Kept separate from `lib/plans.ts` (which is imported by client components)
 * so that server-only env vars are never pulled into the client bundle.
 */
export function planIdForPrice(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  if (priceId === env.stripePriceMonthly) return "pro_monthly";
  if (priceId === env.stripePriceAnnual) return "pro_annual";
  return null;
}

export type CreditPackKind = "writing_pack_5" | "speaking_pack_5";

/** Maps a Stripe Price ID to the credit pack it represents, if any. */
export function creditPackForPrice(priceId: string | null | undefined): CreditPackKind | null {
  if (!priceId) return null;
  if (priceId === env.stripeWritingPack) return "writing_pack_5";
  if (priceId === env.stripeSpeakingPack) return "speaking_pack_5";
  return null;
}
