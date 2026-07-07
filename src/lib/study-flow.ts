import type {
  CompletedSession,
  RecommendedTask,
  Skill,
  TaskSource,
} from "@/lib/types";
import {
  sampleReading,
  sampleSpeakingPrompts,
  sampleVocab,
  sampleWritingPrompts,
} from "@/lib/mock-data";

const DAILY_TASKS_KEY = "eiken-boost-2-daily-tasks";
const SESSIONS_KEY = "eiken-boost-2-sessions";

type DailyTasksState = { date: string; tasks: RecommendedTask[] };
type SessionsState = { date: string; sessions: CompletedSession[] };

export const skillLabel: Record<Skill, string> = {
  vocab: "単語",
  reading: "長文",
  writing: "英作文",
  speaking: "面接",
};

export const skillMeta: Record<Skill, string> = {
  vocab: "5分",
  reading: "5分",
  writing: "5分",
  speaking: "5分",
};

const skillTaskTitle: Record<Skill, string> = {
  vocab: "単語10問",
  reading: "長文1本",
  writing: "英作文1題",
  speaking: "面接1題",
};

function todayKey(date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

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
  notifyStudyFlowChange();
}

// --- tiny pub/sub so components can subscribe to localStorage-backed state
// (used together with useSyncExternalStore to avoid SSR hydration mismatches) ---

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeStudyFlow(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyStudyFlowChange() {
  listeners.forEach((listener) => listener());
}

/** Build today's default set of 3 recommended tasks based on weak areas. */
export function buildDefaultDailyTasks(weakAreas: Skill[]): RecommendedTask[] {
  const thirdSkill: Skill = weakAreas.includes("writing") ? "writing" : "speaking";
  const skills: Skill[] = ["vocab", "reading", thirdSkill];
  return skills.map((skill, index) => ({
    id: `t-${skill}-${index}`,
    skill,
    title: skillTaskTitle[skill],
    meta: skillMeta[skill],
    contentIndex: 0,
    completed: false,
  }));
}

/** Get today's recommended task list, creating a fresh default set if the day changed. */
export function getDailyTasks(weakAreas: Skill[]): RecommendedTask[] {
  const key = todayKey();
  const stored = readJson<DailyTasksState>(DAILY_TASKS_KEY);
  if (stored && stored.date === key) {
    return stored.tasks;
  }
  const tasks = buildDefaultDailyTasks(weakAreas);
  writeJson(DAILY_TASKS_KEY, { date: key, tasks } satisfies DailyTasksState);
  return tasks;
}

export function saveDailyTasks(tasks: RecommendedTask[]) {
  writeJson(DAILY_TASKS_KEY, { date: todayKey(), tasks } satisfies DailyTasksState);
}

export function markRecommendedTaskCompleted(taskId: string, weakAreas: Skill[]) {
  const tasks = getDailyTasks(weakAreas).map((task) =>
    task.id === taskId ? { ...task, completed: true } : task,
  );
  saveDailyTasks(tasks);
  return tasks;
}

export function addRecommendedTask(task: RecommendedTask, weakAreas: Skill[]) {
  const tasks = [...getDailyTasks(weakAreas), task];
  saveDailyTasks(tasks);
  return tasks;
}

export function getNextUnfinishedTask(tasks: RecommendedTask[]) {
  return tasks.find((task) => !task.completed) ?? null;
}

export function allRecommendedTasksCompleted(tasks: RecommendedTask[]) {
  return tasks.length > 0 && tasks.every((task) => task.completed);
}

/** Create an extra bonus task once all of today's recommended tasks are finished. */
export function generateBonusTask(existingTasks: RecommendedTask[], weakAreas: Skill[]): RecommendedTask {
  const rotation: Skill[] = [weakAreas[0] ?? "vocab", "vocab", "reading", "writing", "speaking"];
  const bonusSoFar = existingTasks.filter((t) => t.id.startsWith("bonus-")).length;
  const skill = rotation[bonusSoFar % rotation.length];
  return {
    id: `bonus-${Date.now()}`,
    skill,
    title: `${skillTaskTitle[skill]}（追加）`,
    meta: skillMeta[skill],
    contentIndex: bonusSoFar + 1,
    completed: false,
  };
}

/** Sessions (recommended / repeated / bonus) completed today. */
export function getTodaySessions(): CompletedSession[] {
  const key = todayKey();
  const stored = readJson<SessionsState>(SESSIONS_KEY);
  if (stored && stored.date === key) {
    return stored.sessions;
  }
  writeJson(SESSIONS_KEY, { date: key, sessions: [] } satisfies SessionsState);
  return [];
}

export function addSession(session: CompletedSession) {
  const sessions = [...getTodaySessions(), session];
  writeJson(SESSIONS_KEY, { date: todayKey(), sessions } satisfies SessionsState);
  return sessions;
}

export function recordUserChoice(sessionId: string, choice: CompletedSession["userChoiceAfterCompletion"]) {
  const sessions = getTodaySessions().map((session) =>
    session.id === sessionId ? { ...session, userChoiceAfterCompletion: choice } : session,
  );
  writeJson(SESSIONS_KEY, { date: todayKey(), sessions } satisfies SessionsState);
  return sessions;
}

export function getExtraSessions(sessions: CompletedSession[]) {
  return sessions.filter((session) => session.source !== "recommended_task");
}

// --- React bindings (useSyncExternalStore) ---
// These give components a way to read the localStorage-backed daily tasks /
// sessions state that stays consistent between server and client snapshots
// (avoiding hydration mismatches) and re-renders automatically when the
// underlying data changes (e.g. after completing a task on another page).

// Cache snapshots so useSyncExternalStore's getSnapshot returns a stable
// reference between renders when the underlying data hasn't changed
// (required to avoid an infinite re-render loop).
let cachedTasksKey = "";
let cachedTasks: RecommendedTask[] = [];

export function getDailyTasksSnapshot(weakAreas: Skill[]): RecommendedTask[] {
  const tasks = getDailyTasks(weakAreas);
  const key = JSON.stringify(tasks);
  if (key !== cachedTasksKey) {
    cachedTasksKey = key;
    cachedTasks = tasks;
  }
  return cachedTasks;
}

const EMPTY_TASKS: RecommendedTask[] = [];
export function getDailyTasksServerSnapshot(): RecommendedTask[] {
  return EMPTY_TASKS;
}

let cachedSessionsKey = "";
let cachedSessions: CompletedSession[] = [];

export function getTodaySessionsSnapshot(): CompletedSession[] {
  const sessions = getTodaySessions();
  const key = JSON.stringify(sessions);
  if (key !== cachedSessionsKey) {
    cachedSessionsKey = key;
    cachedSessions = sessions;
  }
  return cachedSessions;
}

const EMPTY_SESSIONS: CompletedSession[] = [];
export function getTodaySessionsServerSnapshot(): CompletedSession[] {
  return EMPTY_SESSIONS;
}

// --- content pool helpers ---

const poolSizes: Record<Skill, number> = {
  vocab: sampleVocab.length,
  reading: sampleReading.length,
  writing: sampleWritingPrompts.length,
  speaking: sampleSpeakingPrompts.length,
};

export function nextContentIndex(skill: Skill, currentIndex: number) {
  const size = poolSizes[skill] || 1;
  return (currentIndex + 1) % size;
}

export function getVocabSet(contentIndex: number) {
  const size = sampleVocab.length;
  const offset = ((contentIndex % size) + size) % size;
  return [...sampleVocab.slice(offset), ...sampleVocab.slice(0, offset)];
}

export function getReadingPassage(contentIndex: number) {
  const size = sampleReading.length;
  return sampleReading[((contentIndex % size) + size) % size];
}

export function getWritingPrompt(contentIndex: number) {
  const size = sampleWritingPrompts.length;
  return sampleWritingPrompts[((contentIndex % size) + size) % size];
}

export function getSpeakingPrompt(contentIndex: number) {
  const size = sampleSpeakingPrompts.length;
  return sampleSpeakingPrompts[((contentIndex % size) + size) % size];
}

// --- navigation params ---

export type TaskParams = {
  taskId: string;
  source: TaskSource;
  contentIndex: number;
  sourceTaskId?: string;
};

export function buildTaskUrl(skill: Skill, params: TaskParams) {
  const search = new URLSearchParams({
    taskId: params.taskId,
    source: params.source,
    idx: String(params.contentIndex),
  });
  if (params.sourceTaskId) search.set("srcId", params.sourceTaskId);
  return `/app/${skill}?${search.toString()}`;
}

export function parseTaskParams(
  searchParams: URLSearchParams,
  fallbackTaskId: string,
): TaskParams {
  const taskId = searchParams.get("taskId") ?? fallbackTaskId;
  const source = (searchParams.get("source") as TaskSource | null) ?? "recommended_task";
  const idxRaw = Number(searchParams.get("idx"));
  const contentIndex = Number.isFinite(idxRaw) ? idxRaw : 0;
  const sourceTaskId = searchParams.get("srcId") ?? undefined;
  return { taskId, source, contentIndex, sourceTaskId };
}

/** Generate a reasonably unique id for ad-hoc sessions/tasks created on the client. */
export function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Resolve which task entry a skill page should use when it was opened
 * without explicit query params (e.g. tapped from the bottom nav or the
 * skill shortcut grid on the home screen instead of a completion-screen
 * button).
 */
export function resolveTaskEntry(skill: Skill, weakAreas: Skill[]): TaskParams {
  const tasks = getDailyTasks(weakAreas);
  const unfinished = tasks.find((task) => task.skill === skill && !task.completed);
  if (unfinished) {
    return { taskId: unfinished.id, source: "recommended_task", contentIndex: unfinished.contentIndex };
  }
  const existing = tasks.find((task) => task.skill === skill);
  const contentIndex = existing ? nextContentIndex(skill, existing.contentIndex) : 0;
  return {
    taskId: makeId("adhoc"),
    source: "repeated_task",
    contentIndex,
    sourceTaskId: existing?.id,
  };
}

// --- coach copy ---

export function coachComment(skill: Skill, score: number) {
  const label = skillLabel[skill];
  if (score >= 80) {
    return `${label}はとても良い出来です。この調子で自信を積み重ねていきましょう。`;
  }
  if (score >= 60) {
    return `${label}は着実に力がついています。あと少しで安定して得点できそうです。`;
  }
  return `${label}はまだ伸びしろがあります。焦らず、今日の1問1問を丁寧に振り返りましょう。`;
}

export function summaryText(skill: Skill, score: number, detail?: string) {
  if (detail) return detail;
  return `${skillLabel[skill]}のタスクが終わりました。スコアは ${score} 点です。`;
}
