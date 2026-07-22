"use client";

import { Suspense, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpenCheck, ClipboardCheck, MessagesSquare, X } from "lucide-react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { SkillPill } from "@/components/ui/skill-pill";
import { PlanCards } from "@/components/app/plan-cards";
import { PlanComparison } from "@/components/app/plan-comparison";
import { PaywallFaq } from "@/components/app/paywall-faq";
import { useStoredProfile, useStoredAssessment } from "@/lib/app-state";
import { creditPacks } from "@/lib/plans";
import { getTodaySessionsServerSnapshot, getTodaySessionsSnapshot, subscribeStudyFlow } from "@/lib/study-flow";
import {
  buildPaywallCopy,
  fallbackWeakAreas,
  hasHitFreeLimit,
  markReofferedFor,
  recordPaywallClosed,
  recordPaywallShown,
  usePaywallVariant,
} from "@/lib/paywall";
import type { ReofferReason } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { useSyncProfileFromSupabase } from "@/lib/supabase/sync-profile";

const valueBullets = [
  { icon: ClipboardCheck, text: "毎日の学習メニューを自動作成" },
  { icon: BookOpenCheck, text: "英作文を具体的に添削" },
  { icon: MessagesSquare, text: "面接練習を何度でも改善" },
];

async function startCheckout(kind: string) {
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
  });
  const data = await response.json();
  if (data.url) window.location.href = data.url;
}

function PaywallPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reofferReason = searchParams.get("reoffer");
  const justCheckedOut = searchParams.get("checkout") === "success";

  // Hydration-safe pattern: this page is statically pre-rendered, so the
  // server always renders with neutral defaults (mock profile/assessment,
  // Variant A, 0 completed sessions today). `useSyncExternalStore` reads
  // localStorage on the client but keeps returning the server's snapshot
  // until after hydration, then re-renders once with the real values — this
  // avoids the hydration mismatch that a plain
  // `useState(() => getStoredProfile())` would cause whenever the user's
  // real data differs from the defaults (e.g. after onboarding, or after
  // completing tasks today).
  const [profile] = useStoredProfile();
  const assessment = useStoredAssessment();
  const variant = usePaywallVariant();

  // After a successful Stripe checkout, the webhook updates Supabase
  // asynchronously (usually within a second or two). Re-pull the user's
  // real plan/credits here so the paywall — and the rest of the app, since
  // this writes into the same localStorage-backed profile — reflects the
  // purchase without requiring a manual refresh or re-login.
  useSyncProfileFromSupabase({ pollForUpdate: justCheckedOut });
  const todaysCompletedCount = useSyncExternalStore(
    subscribeStudyFlow,
    () => getTodaySessionsSnapshot().length,
    () => getTodaySessionsServerSnapshot().length,
  );
  const [loading, setLoading] = useState<string | null>(null);

  const onboardingWeakAreas = profile.weakAreas as typeof assessment.weakAreas;
  const weakAreas = useMemo(
    () => fallbackWeakAreas(assessment, onboardingWeakAreas),
    [assessment, onboardingWeakAreas],
  );

  const hitLimit = hasHitFreeLimit(profile.planId, profile.usedWriting, profile.usedSpeaking);

  const copy = useMemo(
    () => buildPaywallCopy({ weakAreas, todaysCompletedCount, hitFreeLimit: hitLimit }),
    [weakAreas, todaysCompletedCount, hitLimit],
  );

  // Variant B: surface the personalized weakness reason directly on the Annual
  // card itself (rather than only in the headline/summary above), so the
  // "why annual, why now, why me" story is reinforced right at the decision point.
  const weaknessHighlight =
    copy.weaknessSentence && copy.contextType !== "generic"
      ? `${copy.weaknessSentence.replace("あなたの苦手分野：", "")}を集中的に強化 → ${copy.primaryValueBullet}`
      : null;

  // Fires once the real (post-hydration) profile/assessment/variant/session
  // data is in — `copy` above is derived from the same `useSyncExternalStore`
  // values, so by the time this effect runs it already reflects the real
  // personalization, not the server-rendered placeholder.
  useEffect(() => {
    recordPaywallShown();
    trackEvent("paywall_viewed", { contextType: copy.contextType, variant, reoffer: reofferReason ?? undefined });
    trackEvent("paywall_context_type", { contextType: copy.contextType });
    if (copy.weaknessSkills.length > 0) {
      trackEvent("paywall_weakness_personalized", { weakAreas: copy.weaknessSkills });
    }
    if (reofferReason) {
      trackEvent("paywall_reoffer_shown", { reason: reofferReason });
      markReofferedFor(reofferReason as ReofferReason);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    recordPaywallClosed();
    trackEvent("paywall_closed", { contextType: copy.contextType });
    router.push("/app");
  };

  const handleSelectAnnual = async () => {
    trackEvent("annual_selected", { contextType: copy.contextType, variant });
    setLoading("pro_annual");
    trackEvent("annual_checkout_started", { variant });
    await startCheckout("pro_annual");
    setLoading(null);
  };

  const handleSelectMonthly = async () => {
    trackEvent("monthly_selected", { contextType: copy.contextType, variant });
    setLoading("pro_monthly");
    trackEvent("monthly_checkout_started", { variant });
    await startCheckout("pro_monthly");
    setLoading(null);
  };

  const handleContinueFree = () => {
    trackEvent("free_continue_selected", { contextType: copy.contextType });
    setLoading("free");
    router.push("/app");
  };

  return (
    <MobileShell title="プラン" subtitle="あなたに合う続け方を、正直な料金でご案内します。">
      <button
        type="button"
        onClick={handleClose}
        className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600"
      >
        <X className="h-3.5 w-3.5" />
        あとで見る
      </button>

      {/* A. Personalized headline */}
      <Card className="rounded-[2rem] bg-slate-950 text-white">
        <SkillPill tone="blue">英検2級コーチ</SkillPill>
        <h1 className="mt-3 text-2xl font-black leading-snug">{copy.headline}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">{copy.subheadline}</p>
      </Card>

      {/* B. Personalized weakness summary */}
      {copy.weaknessSentence ? (
        <Card className="mt-4 rounded-[1.75rem] bg-amber-50">
          <p className="text-sm font-semibold text-amber-800">{copy.weaknessSentence}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            苦手を見える化して、勉強のムダを減らします。Proなら弱点に合わせた練習量を確保できます。
          </p>
        </Card>
      ) : null}

      {copy.momentumNote ? (
        <Card className="mt-4 rounded-[1.5rem] bg-sky-50">
          <p className="text-sm leading-6 text-sky-800">{copy.momentumNote}</p>
        </Card>
      ) : null}

      {copy.limitNote ? (
        <Card className="mt-4 rounded-[1.5rem] bg-rose-50">
          <p className="text-sm leading-6 text-rose-700">{copy.limitNote}</p>
        </Card>
      ) : null}

      {copy.habitNote ? (
        <Card className="mt-4 rounded-[1.5rem] bg-emerald-50">
          <p className="text-sm leading-6 text-emerald-800">{copy.habitNote}</p>
        </Card>
      ) : null}

      {/* C. Value section — outcomes, not just features */}
      <div className="mt-5 grid gap-3">
        {valueBullets.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.text} className="rounded-[1.5rem]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-2.5 text-sky-700">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-slate-800">{item.text}</p>
              </div>
            </Card>
          );
        })}
        <Card className="rounded-[1.5rem] bg-slate-50">
          <p className="text-sm leading-6 text-slate-600">模試と進捗分析で、合格までの距離がわかるようになります。</p>
        </Card>
      </div>

      {/* D + E. Plan cards + CTAs */}
      <div className="mt-6">
        <PlanCards
          loadingPlan={loading}
          onSelectAnnual={handleSelectAnnual}
          onSelectMonthly={handleSelectMonthly}
          onContinueFree={handleContinueFree}
          emphasizeSavings={variant === "A"}
          weaknessHighlight={variant === "B" ? weaknessHighlight : null}
        />
      </div>

      {/* Feature comparison */}
      <div className="mt-6">
        <PlanComparison />
      </div>

      {/* FAQ / objection handling */}
      <div className="mt-6">
        <PaywallFaq />
      </div>

      {/* Credit packs — for users who only want occasional writing/speaking help */}
      <Card className="mt-6 rounded-[1.75rem]">
        <p className="text-sm font-semibold text-sky-700">たまに使いたい方へ</p>
        <p className="mt-1 text-xs text-slate-500">英作文・面接だけ追加したい場合はこちら</p>
        <div className="mt-4 grid gap-3">
          {creditPacks.map((pack) => (
            <div key={pack.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{pack.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{pack.description}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    setLoading(pack.id);
                    await startCheckout(pack.id);
                    setLoading(null);
                  }}
                >
                  {loading === pack.id ? "準備中" : pack.priceLabel}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="mt-6 text-center text-xs leading-5 text-slate-400">
        まずは自分に合うか試せます。いつでも解約でき、学習履歴はそのまま残ります。
      </p>
      <p className="mt-3 text-center text-xs leading-5 text-slate-400">
        <Link href="/legal/tokushoho" className="underline hover:text-slate-600">
          特定商取引法に基づく表記
        </Link>
        {" ・ "}
        <Link href="/legal/terms" className="underline hover:text-slate-600">
          利用規約
        </Link>
        {" ・ "}
        <Link href="/legal/privacy" className="underline hover:text-slate-600">
          プライバシーポリシー
        </Link>
      </p>
    </MobileShell>
  );
}

export default function PaywallPage() {
  return (
    <Suspense fallback={null}>
      <PaywallPageInner />
    </Suspense>
  );
}
