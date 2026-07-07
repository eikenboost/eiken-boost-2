"use client";

import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { annualMonthlyEquivalent, annualSavingsPercent, annualSavingsYen, formatYen, planCatalog } from "@/lib/plans";
import { cn } from "@/lib/utils";

type PlanCardsProps = {
  loadingPlan: string | null;
  onSelectAnnual: () => void;
  onSelectMonthly: () => void;
  onContinueFree: () => void;
  /** Variant A treatment: stronger, more prominent savings emphasis (amber badge + yen amount). */
  emphasizeSavings?: boolean;
  /** Variant B treatment: a short personalized reason-to-upgrade line shown directly on the Annual card. */
  weaknessHighlight?: string | null;
};

export function PlanCards({
  loadingPlan,
  onSelectAnnual,
  onSelectMonthly,
  onContinueFree,
  emphasizeSavings,
  weaknessHighlight,
}: PlanCardsProps) {
  const monthlyEquivalent = annualMonthlyEquivalent();
  const savingsPercent = annualSavingsPercent();
  const savingsYen = annualSavingsYen();
  const annual = planCatalog.pro_annual;
  const monthly = planCatalog.pro_monthly;

  return (
    <div className="space-y-4">
      {/* Annual — primary, visually dominant */}
      <Card className="relative rounded-[2rem] border-2 border-sky-500 bg-gradient-to-br from-sky-600 to-sky-700 p-6 text-white shadow-xl shadow-sky-200">
        <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow">
          <Sparkles className="h-3 w-3" />
          {annual.badge}
        </div>
        <div className="flex items-start justify-between gap-4 pt-1">
          <div>
            <p className="text-sm font-semibold text-sky-100">年額プラン</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-black">{formatYen(monthlyEquivalent)}</span>
              <span className="text-sm text-sky-100">/ 月あたり</span>
            </div>
            <p className="mt-1 text-xs text-sky-100">一括 {formatYen(annual.priceYen)}/年（税込）</p>
          </div>
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20">
            <Check className="h-4 w-4 text-white" />
          </div>
        </div>

        <div
          className={cn(
            "mt-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold",
            emphasizeSavings && "bg-amber-400 text-amber-950",
          )}
        >
          月額より{savingsPercent}%お得
          {emphasizeSavings ? <span className="font-semibold">（年間{formatYen(savingsYen)}おトク）</span> : null}
        </div>

        {weaknessHighlight ? (
          <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-xs leading-5 text-sky-50">
            {weaknessHighlight}
          </div>
        ) : null}

        <ul className="mt-5 space-y-2.5 text-sm text-sky-50">
          {annual.features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <Button
            className="w-full justify-between bg-white text-sky-700 shadow-lg hover:bg-sky-50"
            onClick={onSelectAnnual}
          >
            {loadingPlan === "pro_annual" ? "準備中..." : "年額プランではじめる"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-3 flex items-center justify-center gap-1 text-center text-[11px] text-sky-100">
          <ShieldCheck className="h-3 w-3" />
          いつでも解約できます・学習履歴はそのまま残ります
        </p>
      </Card>

      {/* Monthly — secondary, visually quieter */}
      <Card className="rounded-[1.5rem] border border-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-600">月額プラン</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{formatYen(monthly.priceYen)} <span className="text-sm font-medium text-slate-400">/ 月</span></p>
          </div>
          <Button
            variant="secondary"
            className="shrink-0"
            onClick={onSelectMonthly}
          >
            {loadingPlan === "pro_monthly" ? "準備中" : "月額ではじめる"}
          </Button>
        </div>
      </Card>

      {/* Free continuation — visible but low emphasis (tertiary) */}
      <button
        type="button"
        onClick={onContinueFree}
        className="mx-auto block text-center text-xs font-medium text-slate-400 underline decoration-slate-300 underline-offset-4 hover:text-slate-600"
      >
        {loadingPlan === "free" ? "処理中..." : "無料プランのまま続ける"}
      </button>
    </div>
  );
}
