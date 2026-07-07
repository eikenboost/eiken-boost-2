"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Skill, TaskSource, UserChoiceAfterCompletion } from "@/lib/types";
import { getStoredProfile, getStoredAssessment } from "@/lib/app-state";
import { mockProfile, sampleAssessment } from "@/lib/mock-data";
import {
  addRecommendedTask,
  addSession,
  buildTaskUrl,
  generateBonusTask,
  getDailyTasks,
  getNextUnfinishedTask,
  getTodaySessions,
  makeId,
  markRecommendedTaskCompleted,
  nextContentIndex,
  parseTaskParams,
  recordUserChoice,
} from "@/lib/study-flow";

type Phase = "task" | "completion" | "finished";

/**
 * Shared post-task flow logic used by the vocab / reading / writing / speaking
 * pages. Handles: reading which task entry the page was opened for, recording
 * the completed session, and the 4 post-task navigation choices.
 */
export function useTaskFlow(skill: Skill) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profile] = useState(() => (typeof window === "undefined" ? mockProfile : getStoredProfile()));
  const [assessment] = useState(() => (typeof window === "undefined" ? sampleAssessment : getStoredAssessment()));
  const weakAreas = assessment.weakAreas;

  const params = useMemo(() => {
    const fallbackTaskId = makeId(`${skill}-adhoc`);
    return parseTaskParams(searchParams, fallbackTaskId);
  }, [searchParams, skill]);

  const [phase, setPhase] = useState<Phase>("task");
  const [score, setScore] = useState(0);
  const [summary, setSummary] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [nextIsBonus, setNextIsBonus] = useState(false);

  function complete(finalScore: number, summaryText: string) {
    const source: TaskSource = params.source;
    const id = makeId("session");

    addSession({
      id,
      category: skill,
      source,
      completedAt: new Date().toISOString(),
      sourceTaskId: source === "recommended_task" ? params.taskId : params.sourceTaskId,
      score: finalScore,
    });

    if (source === "recommended_task") {
      markRecommendedTaskCompleted(params.taskId, weakAreas);
    }

    const tasks = getDailyTasks(weakAreas);
    const upcoming = getNextUnfinishedTask(tasks.filter((task) => task.id !== params.taskId));
    setNextIsBonus(!upcoming);

    setScore(finalScore);
    setSummary(summaryText);
    setSessionId(id);
    setPhase("completion");
  }

  function recordChoice(choice: UserChoiceAfterCompletion) {
    if (sessionId) recordUserChoice(sessionId, choice);
  }

  function goNextRecommended() {
    recordChoice("next_recommended");
    const tasks = getDailyTasks(weakAreas);
    const upcoming = getNextUnfinishedTask(tasks);
    if (upcoming) {
      router.push(
        buildTaskUrl(upcoming.skill, {
          taskId: upcoming.id,
          source: "recommended_task",
          contentIndex: upcoming.contentIndex,
        }),
      );
      return;
    }
    const bonus = generateBonusTask(tasks, weakAreas);
    addRecommendedTask(bonus, weakAreas);
    router.push(
      buildTaskUrl(bonus.skill, {
        taskId: bonus.id,
        source: "bonus_task",
        contentIndex: bonus.contentIndex,
      }),
    );
  }

  function goRepeatSame() {
    recordChoice("repeat_same");
    const newIndex = nextContentIndex(skill, params.contentIndex);
    const sourceTaskId = params.source === "recommended_task" ? params.taskId : params.sourceTaskId;
    router.push(
      buildTaskUrl(skill, {
        taskId: makeId(`${skill}-repeat`),
        source: "repeated_task",
        contentIndex: newIndex,
        sourceTaskId,
      }),
    );
  }

  function goHome() {
    recordChoice("go_home");
    router.push("/app");
  }

  function finishToday() {
    recordChoice("finish_today");
    setPhase("finished");
  }

  const todaysCompletedCount = phase === "task" ? 0 : getTodaySessions().length;

  const nextButtonLabel = nextIsBonus ? "追加のおすすめタスクへ" : "次のおすすめに進む";

  return {
    profile,
    assessment,
    params,
    phase,
    score,
    summary,
    todaysCompletedCount,
    nextButtonLabel,
    complete,
    goNextRecommended,
    goRepeatSame,
    goHome,
    finishToday,
  };
}
