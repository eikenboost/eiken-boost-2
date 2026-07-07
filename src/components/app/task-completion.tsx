"use client";

import { ArrowRight, CheckCircle2, Home, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SkillPill } from "@/components/ui/skill-pill";
import type { Skill, TaskSource } from "@/lib/types";
import { skillLabel } from "@/lib/study-flow";

const sourceLabel: Record<TaskSource, string> = {
  recommended_task: "今日のおすすめ",
  repeated_task: "追加練習",
  bonus_task: "追加のおすすめタスク",
};

type TaskCompletionProps = {
  skill: Skill;
  source: TaskSource;
  score: number;
  summary: string;
  coachComment: string;
  nextButtonLabel?: string;
  onNextRecommended: () => void;
  onRepeatSame: () => void;
  onGoHome: () => void;
  onFinishToday: () => void;
};

export function TaskCompletion({
  skill,
  source,
  score,
  summary,
  coachComment,
  nextButtonLabel = "次のおすすめに進む",
  onNextRecommended,
  onRepeatSame,
  onGoHome,
  onFinishToday,
}: TaskCompletionProps) {
  return (
    <div className="mt-5 space-y-4">
      <Card className="rounded-[2rem] bg-slate-950 text-white">
        <div className="flex items-center gap-2">
          <SkillPill tone="blue">{sourceLabel[source]}</SkillPill>
          <span className="text-xs text-slate-400">{skillLabel[skill]}</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-2.5">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-sky-300">お疲れさまでした</p>
            <h2 className="mt-1 text-2xl font-black">タスク完了</h2>
          </div>
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-400">今回のスコア</p>
            <p className="mt-1 text-4xl font-black">{score}</p>
          </div>
          <Sparkles className="h-6 w-6 text-amber-300" />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">{summary}</p>
      </Card>

      <Card className="rounded-[1.75rem] bg-sky-50">
        <p className="text-sm font-semibold text-sky-700">コーチから一言</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{coachComment}</p>
      </Card>

      <div className="grid gap-3">
        <Button onClick={onNextRecommended} className="w-full justify-between">
          {nextButtonLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="secondary" onClick={onRepeatSame} className="w-full justify-between">
          同じ形式でもう1回
          <RotateCcw className="h-4 w-4" />
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="ghost" onClick={onGoHome} className="justify-center">
            <Home className="mr-2 h-4 w-4" />
            ホームに戻る
          </Button>
          <Button variant="ghost" onClick={onFinishToday} className="justify-center">
            今日はここまで
          </Button>
        </div>
      </div>
    </div>
  );
}
