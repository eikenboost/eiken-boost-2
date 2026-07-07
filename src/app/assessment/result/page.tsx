"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleAlert, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkillPill } from "@/components/ui/skill-pill";
import { getStoredAssessment } from "@/lib/app-state";
import { sampleAssessment } from "@/lib/mock-data";
import type { AssessmentResult } from "@/lib/types";

const skillLabel: Record<string, string> = {
  vocab: "単語",
  reading: "長文",
  writing: "英作文",
  speaking: "面接",
};

export default function AssessmentResultPage() {
  const [result] = useState<AssessmentResult>(() => (typeof window === "undefined" ? sampleAssessment : getStoredAssessment()));

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-10 pt-6">
      <Card className="rounded-[2rem] bg-slate-950 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sky-300">診断結果</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{result.estimatedLevel}</h1>
            <p className="mt-3 text-sm text-slate-300">スコア目安 {result.score} / 100</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-sky-200">
            <Trophy className="h-5 w-5" />
          </div>
        </div>
      </Card>

      <Card className="mt-5 rounded-[1.75rem]">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
          <CircleAlert className="h-4 w-4" />
          苦手Top 3
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {result.weakAreas.map((area) => (
            <SkillPill key={area} tone="amber">{skillLabel[area]}</SkillPill>
          ))}
        </div>
      </Card>

      <Card className="mt-5 rounded-[1.75rem]">
        <p className="text-sm font-semibold text-sky-700">おすすめ15分プラン</p>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          {result.dailyPlan.map((item) => (
            <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</li>
          ))}
        </ul>
      </Card>

      <div className="mt-6 grid gap-3">
        <Link href="/app">
          <Button className="w-full justify-between">
            今日の学習を始める
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/app/paywall">
          <Button variant="secondary" className="w-full">年額プランを見る</Button>
        </Link>
      </div>
    </main>
  );
}
