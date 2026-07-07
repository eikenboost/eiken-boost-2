"use client";

import { useSyncExternalStore } from "react";
import type {
  AssessmentResult,
  CompletedSession,
  PaywallContextType,
  PaywallVariant,
  ReofferReason,
  Skill,
} from "@/lib/types";
import { skillLabel } from "@/lib/study-flow";

const VARIANT_KEY = "eiken-boost-2-paywall-variant";
const STATE_KEY = "eiken-boost-2-paywall-state";
const FIRST_SEEN_KEY = "eiken-boost-2-first-seen";

type PaywallState = {
  lastClosedAt?: string;
  lastShownAt?: string;
  reoffersShown: ReofferReason[];
};

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

// --- A/B variant assignment -------------------------------------------------
// Deterministic-once assignment persisted per browser so a given user always
// sees the same variant. No experimentation platform required: swapping the
// copy/layout per variant is handled entirely in this module + the paywall
// page, so wiring up a real assignment service later is a small change.

export function getPaywallVariant(): PaywallVariant {
  const stored = readJson<PaywallVariant>(VARIANT_KEY);
  if (stored === "A" || stored === "B") return stored;
  const assigned: PaywallVariant = Math.random() < 0.5 ? "A" : "B";
  writeJson(VARIANT_KEY, assigned);
  return assigned;
}

/**
 * Server snapshot for `useSyncExternalStore`. The paywall page is statically
 * pre-rendered, so the server always "sees" Variant A; the real (possibly
 * randomly-assigned) variant is read on the client right after hydration via
 * `getPaywallVariant`, avoiding any hydration mismatch.
 */
export function getPaywallVariantServerSnapshot(): PaywallVariant {
  return "A";
}

// The variant is assigned once per browser and never changes afterwards, so
// there's nothing to subscribe to — `useSyncExternalStore` just needs a
// stable no-op subscribe function.
function noopSubscribe() {
  return () => {};
}

/** Hydration-safe variant reader: "A" on the server/first paint, then the real assigned variant. */
export function usePaywallVariant(): PaywallVariant {
  return useSyncExternalStore(noopSubscribe, getPaywallVariant, getPaywallVariantServerSnapshot);
}

// --- First-seen tracking (used for the Day 7 / Day 14 habit narrative) -----

export function getFirstSeenAt(): string {
  const stored = readJson<string>(FIRST_SEEN_KEY);
  if (stored) return stored;
  const now = new Date().toISOString();
  writeJson(FIRST_SEEN_KEY, now);
  return now;
}

export function daysSinceFirstSeen(): number {
  const first = new Date(getFirstSeenAt()).getTime();
  const diffMs = Date.now() - first;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// --- Paywall view/close/re-offer state --------------------------------------

function getState(): PaywallState {
  return readJson<PaywallState>(STATE_KEY) ?? { reoffersShown: [] };
}

function saveState(state: PaywallState) {
  writeJson(STATE_KEY, state);
}

export function recordPaywallShown() {
  const state = getState();
  state.lastShownAt = new Date().toISOString();
  saveState(state);
}

export function recordPaywallClosed() {
  const state = getState();
  state.lastClosedAt = new Date().toISOString();
  saveState(state);
}

/** Have we already soft re-offered for this reason? Prevents spamming the same nudge repeatedly. */
export function hasReofferedFor(reason: ReofferReason): boolean {
  return getState().reoffersShown.includes(reason);
}

/** Call once when a re-offer paywall view is actually rendered to the user. */
export function markReofferedFor(reason: ReofferReason) {
  const state = getState();
  if (!state.reoffersShown.includes(reason)) {
    state.reoffersShown.push(reason);
    saveState(state);
  }
}

/**
 * Decide whether it's an appropriate moment to softly re-offer the paywall
 * after the user previously closed it without subscribing. This intentionally
 * does NOT re-show on every navigation — only at the specific trigger points
 * called out in the spec (task completed, free limit hit, day7+/day14+ return).
 */
export function shouldReoffer(params: {
  planId: string;
  trigger: "task_completed" | "limit_hit" | "return_visit";
  todaysCompletedCount: number;
}): ReofferReason | null {
  if (params.planId !== "free") return null;

  const state = getState();
  if (!state.lastClosedAt) return null; // never dismissed a paywall — no need to "re"-offer

  if (params.trigger === "limit_hit" && !hasReofferedFor("limit_hit")) {
    return "limit_hit";
  }

  if (params.trigger === "task_completed" && params.todaysCompletedCount >= 2 && !hasReofferedFor("task_completed")) {
    return "task_completed";
  }

  if (params.trigger === "return_visit") {
    const days = daysSinceFirstSeen();
    if (days >= 14 && !hasReofferedFor("day14")) return "day14";
    if (days >= 7 && !hasReofferedFor("day7")) return "day7";
  }

  return null;
}

// --- Personalized paywall copy ---------------------------------------------

export type PaywallCopy = {
  contextType: PaywallContextType;
  headline: string;
  subheadline: string;
  weaknessSkills: Skill[];
  weaknessSentence: string | null;
  momentumNote: string | null;
  limitNote: string | null;
  habitNote: string | null;
  primaryValueBullet: string;
};

const genericHeadline = "独学で迷わない、あなた専用の英検2級コーチ";

const headlineByContext: Record<PaywallContextType, string> = {
  writing_weak: "英作文を強化すると、合格にぐっと近づきます",
  speaking_weak: "面接練習を重ねると、合格にぐっと近づきます",
  reading_weak: "長文の読み方を整えると、合格にぐっと近づきます",
  momentum: "この調子で続けると、合格ペースを維持できます",
  limit_hit: "続けたい気持ちを、そのまま学習に変えましょう",
  habit_day7: "毎日の学習が、もう習慣になってきています",
  generic: genericHeadline,
};

const primaryValueByContext: Record<PaywallContextType, string> = {
  writing_weak: "英作文の改善点が具体的にわかる",
  speaking_weak: "面接練習の不安が減る",
  reading_weak: "長文の設問パターンが見えてくる",
  momentum: "今日やるべき勉強がすぐ決まる",
  limit_hit: "今日やるべき勉強がすぐ決まる",
  habit_day7: "毎日の学習メニューを自動作成",
  generic: "今日やるべき勉強がすぐ決まる",
};

/**
 * Build the personalized paywall narrative. Priority order when multiple
 * signals are true at once: hitting a free limit (immediate, actionable) >
 * detected weak area (core value prop) > momentum > habit-forming return >
 * generic fallback. Momentum/limit/habit notes are still surfaced as
 * secondary microcopy even when they aren't the primary headline driver.
 */
export function buildPaywallCopy(params: {
  weakAreas: Skill[];
  todaysCompletedCount: number;
  hitFreeLimit: boolean;
}): PaywallCopy {
  const { weakAreas, todaysCompletedCount, hitFreeLimit } = params;
  const isDay7Plus = typeof window !== "undefined" && daysSinceFirstSeen() >= 7;

  let contextType: PaywallContextType = "generic";
  if (hitFreeLimit) {
    contextType = "limit_hit";
  } else if (weakAreas.includes("writing")) {
    contextType = "writing_weak";
  } else if (weakAreas.includes("speaking")) {
    contextType = "speaking_weak";
  } else if (weakAreas.includes("reading")) {
    contextType = "reading_weak";
  } else if (todaysCompletedCount >= 2) {
    contextType = "momentum";
  } else if (isDay7Plus) {
    contextType = "habit_day7";
  }

  const weaknessSkills = weakAreas.slice(0, 3);
  const weaknessSentence =
    weaknessSkills.length > 0
      ? `あなたの苦手分野：${weaknessSkills.map((skill) => skillLabel[skill]).join(" / ")}`
      : null;

  const momentumNote =
    todaysCompletedCount >= 2
      ? `今日はすでに ${todaysCompletedCount} 個のタスクを完了しました。この継続が合格力になります。`
      : null;

  const limitNote = hitFreeLimit
    ? "無料プランの範囲を使い切りました。Proなら同じ勢いのまま練習を続けられます。"
    : null;

  const habitNote = isDay7Plus
    ? "1週間以上続けられています。ここからが学習習慣の定着どころです。"
    : null;

  return {
    contextType,
    headline: headlineByContext[contextType],
    subheadline: "いまの弱点に合わせて、毎日の学習を自動最適化します。",
    weaknessSkills,
    weaknessSentence,
    momentumNote,
    limitNote,
    habitNote,
    primaryValueBullet: primaryValueByContext[contextType],
  };
}

export function fallbackWeakAreas(assessment: Pick<AssessmentResult, "weakAreas">, onboardingWeakAreas: Skill[]): Skill[] {
  if (assessment.weakAreas && assessment.weakAreas.length > 0) return assessment.weakAreas;
  if (onboardingWeakAreas && onboardingWeakAreas.length > 0) return onboardingWeakAreas;
  return [];
}

export function hasHitFreeLimit(planId: string, usedWriting: number, usedSpeaking: number): boolean {
  if (planId !== "free") return false;
  // Kept in sync with planCatalog.free limits in lib/plans.ts.
  const FREE_WRITING_LIMIT = 1;
  const FREE_SPEAKING_LIMIT = 1;
  return usedWriting >= FREE_WRITING_LIMIT || usedSpeaking >= FREE_SPEAKING_LIMIT;
}

export function countTodaySessions(sessions: CompletedSession[]): number {
  return sessions.length;
}
