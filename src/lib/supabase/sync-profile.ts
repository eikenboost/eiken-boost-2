"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { saveStoredProfile } from "@/lib/app-state";
import type { PlanId } from "@/lib/types";

const VALID_PLAN_IDS: PlanId[] = ["free", "pro_monthly", "pro_annual"];

/**
 * Pulls the signed-in user's real plan + credit balances from Supabase and
 * merges them into the local profile store used throughout the app.
 *
 * Why this exists: Stripe checkout/webhook now update `subscriptions` and
 * `credit_balances` in Supabase (the source of truth once a purchase
 * completes), but the rest of the UI still reads `profile.planId` /
 * `profile.credits` from localStorage (see `lib/app-state.ts`) for
 * hydration-safety and to work in demo mode without any backend at all.
 * This hook bridges the two: on mount (and once right after a Stripe
 * checkout redirect), if the user is signed in, fetch the DB state and copy
 * it into local storage so the whole app reflects the real plan.
 *
 * Signed-out / demo-mode users are left untouched — `profile.planId` keeps
 * behaving exactly as before (a plain local toggle).
 *
 * @param opts.pollForUpdate If true, retry a few times a couple of seconds
 * apart. Stripe delivers the webhook asynchronously (typically within 1-2s,
 * occasionally longer), so right after the `checkout=success` redirect the
 * DB write may not have landed yet on the very first fetch. Pass this on the
 * paywall page's success redirect so the UI catches up without requiring a
 * manual refresh.
 */
export function useSyncProfileFromSupabase(opts: { pollForUpdate?: boolean } = {}) {
  const { pollForUpdate = false } = opts;

  useEffect(() => {
    let cancelled = false;

    async function fetchOnce(): Promise<boolean> {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return false;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return false;

      const [{ data: subscription }, { data: credits }] = await Promise.all([
        supabase.from("subscriptions").select("plan_id, status").eq("user_id", user.id).maybeSingle(),
        supabase.from("credit_balances").select("credit_type, balance").eq("user_id", user.id),
      ]);

      if (cancelled) return false;

      const planId = subscription?.plan_id;
      const patch: Record<string, unknown> = {};

      if (planId && VALID_PLAN_IDS.includes(planId as PlanId)) {
        patch.planId = planId;
      }

      if (credits && credits.length > 0) {
        const writing = credits.find((c) => c.credit_type === "writing")?.balance;
        const speaking = credits.find((c) => c.credit_type === "speaking")?.balance;
        patch.credits = {
          writing: writing ?? 0,
          speaking: speaking ?? 0,
        };
      }

      if (Object.keys(patch).length > 0) {
        saveStoredProfile(patch);
      }

      // Signal to the retry loop whether a paid plan was actually found yet.
      return planId ? planId !== "free" : false;
    }

    async function run() {
      const foundPaidPlan = await fetchOnce();
      if (!pollForUpdate || foundPaidPlan) return;

      // Webhook hasn't landed yet — retry a few times with backoff.
      const delaysMs = [1500, 2500, 4000];
      for (const delay of delaysMs) {
        if (cancelled) return;
        await new Promise((resolve) => setTimeout(resolve, delay));
        if (cancelled) return;
        const done = await fetchOnce();
        if (done) return;
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [pollForUpdate]);
}
