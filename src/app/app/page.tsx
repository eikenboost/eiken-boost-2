"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, CheckCircle2, Flame, MessageSquareQuote, Mic, Sparkles, TrendingUp } from "lucide-react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkillPill } from "@/components/ui/skill-pill";
import { useStoredAssessment, useStoredProfile } from "@/lib/app-state";
import { getRemainingUsage } from "@/lib/plans";
import { jpDateLabel } from "@/lib/utils";
import {
  addRecommendedTask,
  allRecommendedTasksCompleted,
  generateBonusTask,
  getDailyTasksServerSnapshot,
  getDailyTasksSnapshot,
  getExtraSessions,
  getTodaySessionsServerSnapshot,
  getTodaySessionsSnapshot,
  buildTaskUrl,
  resolveTaskEntry,
  skillLabel,
  subscribeStudyFlow,
} from "@/lib/study-flow";
import type { Skill } from "@/lib/types";
import { shouldReoffer } from "@/lib/paywall";

const labelMap = skillLabel;

const skillIconTone: Record<string, "blue" | "amber" | "emerald"> = {
  vocab: "blue",
  reading: "emerald",
  writing: "amber",
  speaking: "amber",
};

export default function AppHomePage() {
  const router = useRouter();
  // Hydration-safe: this page is statically pre-rendered, so the server
  // always renders with the neutral mock defaults. `useStoredProfile` /
  // `useStoredAssessment` use `useSyncExternalStore` under the hood, so they
  // return the same mock defaults on the very first client render (matching
  // the server-rendered HTML) and then re-render once with the real
  // localStorage-backed values right after hydration.
  const [profile] = useStoredProfile();
  const assessment = useStoredAssessment();

  const tasks = useSyncExternalStore(
    subscribeStudyFlow,
    () => getDailyTasksSnapshot(assessment.weakAreas),
    getDailyTasksServerSnapshot,
  );
  const sessions = useSyncExternalStore(
    subscribeStudyFlow,
    getTodaySessionsSnapshot,
    getTodaySessionsServerSnapshot,
  );

  const usage = getRemainingUsage(profile.planId as "free" | "pro_monthly" | "pro_annual", profile.usedWriting, profile.usedSpeaking);

  const allDone = useMemo(() => allRecommendedTasksCompleted(tasks), [tasks]);
  const completedCount = tasks.filter((t) => t.completed).length;
  const extraSessions = useMemo(() => getExtraSessions(sessions), [sessions]);

  // Check for a soft re-offer once per mount: if the user previously closed
  // the paywall, gently bring it back only on a return visit several days
  // later (Day 7 / Day 14), never on every home-screen load. `profile` here
  // already reflects the real (post-hydration) value by the time this effect
  // runs, since `useSyncExternalStore` resolves before effects fire.
  useEffect(() => {
    const reason = shouldReoffer({
      planId: profile.planId,
      trigger: "return_visit",
      todaysCompletedCount: sessions.length,
    });
    if (reason) {
      router.push(`/app/paywall?reoffer=${reason}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startBonusTask = () => {
    const bonus = generateBonusTask(tasks, assessment.weakAreas);
    addRecommendedTask(bonus, assessment.weakAreas);
    router.push(buildTaskUrl(bonus.skill, { taskId: bonus.id, source: "bonus_task", contentIndex: bonus.contentIndex }));
  };

  const openSkillShortcut = (skill: Skill) => {
    const entry = resolveTaskEntry(skill, assessment.weakAreas);
    router.push(buildTaskUrl(skill, entry));
  };

  return (
    <MobileShell title={`こんにちは、${profile.name}`} subtitle={`${jpDateLabel()} ・ 今日の15分メニュー`}>
      <Card className="rounded-[2rem] bg-slate-950 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-sky-300">今日のおすすめ</p>
            <h2 className="mt-2 text-2xl font-black">
              {tasks.length > 0 ? `${completedCount} / ${tasks.length} タスク完了` : "3タスクで学習完了"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">AIが苦手分野を見て、今日やる順番まで決めています。</p>
          </div>
          <div className="rounded-3xl bg-white/10 px-4 py-3 text-center">
            <p className="text-2xl font-black">{profile.streak}</p>
            <p className="text-xs text-slate-300">日連続</p>
          </div>
        </div>
      </Card>

      {allDone ? (
        <Card className="mt-5 rounded-[1.75rem] bg-emerald-50">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-semibold">今日のおすすめは完了しました</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            もっと練習したい場合は、追加のおすすめタスクに挑戦できます。
          </p>
          <Button onClick={startBonusTask} className="mt-4 w-full justify-between">
            追加のおすすめタスクを始める
            <Sparkles className="h-4 w-4" />
          </Button>
        </Card>
      ) : (
        <div className="mt-5 grid gap-3">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              disabled={task.completed}
              onClick={() =>
                router.push(
                  buildTaskUrl(task.skill, {
                    taskId: task.id,
                    source: task.id.startsWith("bonus-") ? "bonus_task" : "recommended_task",
                    contentIndex: task.contentIndex,
                  }),
                )
              }
              className="text-left"
            >
              <Card
                className={`rounded-[1.5rem] transition ${task.completed ? "bg-slate-50" : "hover:-translate-y-0.5"}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <SkillPill tone={skillIconTone[task.skill]}>{task.meta}</SkillPill>
                      <span className="text-xs text-slate-400">
                        {task.id.startsWith("bonus-") ? "追加のおすすめタスク" : "おすすめ順"}
                      </span>
                    </div>
                    <h3 className={`mt-3 text-lg font-bold ${task.completed ? "text-slate-400 line-through" : ""}`}>
                      {task.title}
                    </h3>
                  </div>
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-slate-300" />
                  )}
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      {extraSessions.length > 0 ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-700">追加でやったこと</p>
          <div className="mt-3 grid gap-2">
            {extraSessions.map((session) => (
              <Card key={session.id} className="rounded-[1.25rem] bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SkillPill tone={skillIconTone[session.category]}>
                      {session.source === "bonus_task" ? "追加のおすすめ" : "追加練習"}
                    </SkillPill>
                    <span className="text-sm font-medium text-slate-600">{labelMap[session.category]}</span>
                  </div>
                  {typeof session.score === "number" ? (
                    <span className="text-sm font-bold text-slate-700">{session.score}点</span>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

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
        <Card className="rounded-[1.5rem] cursor-pointer" onClick={() => openSkillShortcut("vocab")}>
          <BookOpen className="h-5 w-5 text-sky-700" /><p className="mt-3 font-semibold">単語</p>
        </Card>
        <Card className="rounded-[1.5rem] cursor-pointer" onClick={() => openSkillShortcut("reading")}>
          <TrendingUp className="h-5 w-5 text-emerald-700" /><p className="mt-3 font-semibold">長文</p>
        </Card>
        <Card className="rounded-[1.5rem] cursor-pointer" onClick={() => openSkillShortcut("writing")}>
          <MessageSquareQuote className="h-5 w-5 text-amber-700" /><p className="mt-3 font-semibold">英作文</p><p className="mt-1 text-xs text-slate-400">残り {usage.writingRemaining} 回</p>
        </Card>
        <Card className="rounded-[1.5rem] cursor-pointer" onClick={() => openSkillShortcut("speaking")}>
          <Mic className="h-5 w-5 text-violet-700" /><p className="mt-3 font-semibold">面接</p><p className="mt-1 text-xs text-slate-400">残り {usage.speakingRemaining} 回</p>
        </Card>
      </div>
    </MobileShell>
  );
}
