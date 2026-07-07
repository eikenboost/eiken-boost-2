import type { PlanId } from "@/lib/types";

export const planCatalog = {
  free: {
    id: "free",
    name: "Free",
    priceLabel: "¥0",
    writingLimit: 1,
    speakingLimit: 1,
    period: "週",
    highlight: false,
    features: [
      "単語 1日10問",
      "長文 1日1本",
      "ライティング添削 週1回",
      "スピーキング練習 週1回",
      "シンプル進捗サマリー",
    ],
  },
  pro_monthly: {
    id: "pro_monthly",
    name: "Pro Monthly",
    priceLabel: "¥1,980 / 月",
    priceYen: 1980,
    writingLimit: 3,
    speakingLimit: 3,
    period: "月",
    highlight: false,
    features: [
      "単語・長文・文法使い放題",
      "学習プラン自動生成",
      "苦手分析",
      "ライティング添削 月3回",
      "スピーキング練習 月3回",
    ],
  },
  pro_annual: {
    id: "pro_annual",
    name: "Pro Annual",
    priceLabel: "¥14,800 / 年",
    priceYen: 14800,
    writingLimit: 12,
    speakingLimit: 12,
    period: "月",
    highlight: true,
    badge: "おすすめ",
    features: [
      "全コア学習機能",
      "ライティング添削 月12回",
      "スピーキング練習 月12回",
      "模試モード",
      "詳細アナリティクス",
    ],
  },
} as const;

export const creditPacks = [
  {
    id: "writing_pack_5",
    title: "ライティング追加 5回",
    description: "添削回数を追加で購入",
    priceLabel: "¥980",
  },
  {
    id: "speaking_pack_5",
    title: "スピーキング追加 5回",
    description: "面接練習回数を追加で購入",
    priceLabel: "¥980",
  },
];

export function getRemainingUsage(planId: PlanId, usedWriting = 0, usedSpeaking = 0) {
  const plan = planCatalog[planId];
  return {
    writingRemaining: Math.max(plan.writingLimit - usedWriting, 0),
    speakingRemaining: Math.max(plan.speakingLimit - usedSpeaking, 0),
  };
}

// --- Transparent pricing helpers for the paywall ---
// All numbers are derived directly from planCatalog so the UI never shows
// a savings percentage that doesn't match the actual prices.

/** Annual price expressed as an equivalent monthly cost, rounded to the nearest yen. */
export function annualMonthlyEquivalent(): number {
  return Math.round(planCatalog.pro_annual.priceYen / 12);
}

/** What 12 months of the monthly plan would cost, for an honest side-by-side comparison. */
export function monthlyPlanYearlyCost(): number {
  return planCatalog.pro_monthly.priceYen * 12;
}

/** Percentage saved by choosing annual over 12x monthly, rounded to the nearest whole percent. */
export function annualSavingsPercent(): number {
  const yearlyIfMonthly = monthlyPlanYearlyCost();
  const annual = planCatalog.pro_annual.priceYen;
  return Math.round(((yearlyIfMonthly - annual) / yearlyIfMonthly) * 100);
}

/** Yen amount saved per year by choosing annual over paying monthly for 12 months. */
export function annualSavingsYen(): number {
  return monthlyPlanYearlyCost() - planCatalog.pro_annual.priceYen;
}

export function formatYen(value: number): string {
  return `¥${value.toLocaleString("ja-JP")}`;
}
