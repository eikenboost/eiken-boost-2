"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Flame, MessageSquareQuote, Mic, TrendingUp } from "lucide-react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { SkillPill } from "@/components/ui/skill-pill";
import { getStoredAssessment, getStoredProfile } from "@/lib/app-state";
import { sampleAssessment, mockProfile } from "@/lib/mock-data";
import { getRemainingUsage } from "@/lib/plans";
import { jpDateLabel } from "@/lib/utils";

const labelMap: Record<string, string> = {
  vocab: "単語",
  reading: "長文",
  writing: "英作文",
  speaking: "面接",
};

export default function AppHomePage() {
  const [profile] = useState(() => (typeof window === "undefined" ? mockProfile : getStoredProfile()));
  const [assessment] = useState(() => (typeof window === "undefined" ? sampleAssessment : getStoredAssessment()));

  const tasks = useMemo(
    () => [
      { href: "/app/vocab", title: "単語10問", meta: "5分", tone: "blue" },
      { href: "/app/reading", title: "長文1本", meta: "5分", tone: "emerald" },
      { href: assessment.weakAreas.includes("writing") ? "/app/writing" : "/app/speaking", title: assessment.weakAreas.includes("writing") ? "英作文1題" : "面接1題", meta: "5分", tone: "amber" },
    ],
    [assessment.weakAreas],
  );

  const usage = getRemainingUsage(profile.planId as "free" | "pro_monthly" | "pro_annual", profile.usedWriting, profile.usedSpeaking);

  return (
    <MobileShell title={`こんにちは、${profile.name}`} subtitle={`${jpDateLabel()} ・ 今日の15分メニュー`}>
      <Card className="rounded-[2rem] bg-slate-950 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-sky-300">今日のおすすめ</p>
            <h2 className="mt-2 text-2xl font-black">3タスクで学習完了</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">AIが苦手分野を見て、今日やる順番まで決めています。</p>
          </div>
          <div className="rounded-3xl bg-white/10 px-4 py-3 text-center">
            <p className="text-2xl font-black">{profile.streak}</p>
            <p className="text-xs text-slate-300">日連続</p>
          </div>
        </div>
      </Card>

      <div className="mt-5 grid gap-3">
        {tasks.map((task) => (
          <Link key={task.href} href={task.href}>
            <Card className="rounded-[1.5rem] transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <SkillPill tone={task.tone as "blue" | "amber" | "emerald"}>{task.meta}</SkillPill>
                    <span className="text-xs text-slate-400">おすすめ順</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold">{task.title}</h3>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-4">
        <Card className="rounded-[1.75rem]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <Flame className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold">今週の進み方</p>
            </div>
            <span className="text-xs text-slate-400">7日中5日達成</span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {[70, 65, 80, 0, 75, 90, 40].map((value, index) => (
              <div key={index} className="space-y-2">
                <div className="h-20 rounded-full bg-slate-100 p-1">
                  <div className="mt-auto h-full rounded-full bg-sky-100">
                    <div className="w-full rounded-full bg-sky-600" style={{ height: `${value}%` }} />
                  </div>
                </div>
                <p className="text-center text-[10px] text-slate-400">{["月", "火", "水", "木", "金", "土", "日"][index]}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[1.75rem] bg-amber-50">
          <p className="text-sm font-semibold text-amber-800">今週の弱点</p>
          <h3 className="mt-2 text-lg font-bold">{labelMap[assessment.weakAreas[0]]} と {labelMap[assessment.weakAreas[1]]}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">理由の広げ方と、面接の最初の1文がまだ不安定です。まずは短く正確に答える練習を増やしましょう。</p>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link href="/app/vocab"><Card className="rounded-[1.5rem]"><BookOpen className="h-5 w-5 text-sky-700" /><p className="mt-3 font-semibold">単語</p></Card></Link>
        <Link href="/app/reading"><Card className="rounded-[1.5rem]"><TrendingUp className="h-5 w-5 text-emerald-700" /><p className="mt-3 font-semibold">長文</p></Card></Link>
        <Link href="/app/writing"><Card className="rounded-[1.5rem]"><MessageSquareQuote className="h-5 w-5 text-amber-700" /><p className="mt-3 font-semibold">英作文</p><p className="mt-1 text-xs text-slate-400">残り {usage.writingRemaining} 回</p></Card></Link>
        <Link href="/app/speaking"><Card className="rounded-[1.5rem]"><Mic className="h-5 w-5 text-violet-700" /><p className="mt-3 font-semibold">面接</p><p className="mt-1 text-xs text-slate-400">残り {usage.speakingRemaining} 回</p></Card></Link>
      </div>
    </MobileShell>
  );
}
