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
    writingLimit: 12,
    speakingLimit: 12,
    period: "月",
    highlight: true,
    badge: "いちばんお得",
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
