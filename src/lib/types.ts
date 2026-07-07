export type Skill = "vocab" | "reading" | "writing" | "speaking";
export type PlanId = "free" | "pro_monthly" | "pro_annual";
export type CreditType = "writing" | "speaking";

export type UserType =
  | "高校生"
  | "大学生"
  | "社会人"
  | "その他";

export type ConfidenceLevel = "かなり不安" | "少し不安" | "普通" | "やや自信あり";

export type VocabQuestion = {
  id: string;
  word: string;
  meaning: string;
  choices: string[];
  answer: string;
  explanation: string;
  tag: string;
};

export type ReadingPassage = {
  id: string;
  title: string;
  topic: string;
  difficulty: "基礎" | "標準" | "やや難";
  passage: string;
  questions: {
    id: string;
    question: string;
    choices: string[];
    answer: string;
    explanation: string;
  }[];
};

export type WritingPrompt = {
  id: string;
  prompt: string;
  hint: string;
};

export type SpeakingPrompt = {
  id: string;
  prompt: string;
  followUps: string[];
};

export type AssessmentResult = {
  estimatedLevel: string;
  weakAreas: Skill[];
  dailyPlan: string[];
  score: number;
};

export type WritingFeedback = {
  score: number;
  grammarFeedback: string[];
  structureFeedback: string[];
  vocabFeedback: string[];
  improvedAnswer: string;
  coachComment: string;
};

export type SpeakingFeedback = {
  score: number;
  qualityFeedback: string[];
  naturalPhrasing: string[];
  sampleAnswer: string;
  coachComment: string;
};

// --- Post-task completion flow ---

/** Where a completed study session originated from. */
export type TaskSource = "recommended_task" | "repeated_task" | "bonus_task";

/** What the user chose to do right after finishing a task. */
export type UserChoiceAfterCompletion =
  | "next_recommended"
  | "repeat_same"
  | "go_home"
  | "finish_today";

/** One of today's recommended tasks shown on the home screen. */
export type RecommendedTask = {
  id: string;
  skill: Skill;
  title: string;
  meta: string;
  contentIndex: number;
  completed: boolean;
};

/** A record of one finished study session (recommended, repeated, or bonus). */
export type CompletedSession = {
  id: string;
  category: Skill;
  source: TaskSource;
  completedAt: string;
  sourceTaskId?: string;
  score?: number;
  userChoiceAfterCompletion?: UserChoiceAfterCompletion;
};

// --- Paywall personalization / experimentation ---

/** Which personalized narrative the paywall is currently showing. Tracked as `paywall_context_type`. */
export type PaywallContextType =
  | "writing_weak"
  | "speaking_weak"
  | "reading_weak"
  | "momentum"
  | "limit_hit"
  | "habit_day7"
  | "generic";

/** A/B copy variant. Kept intentionally simple (no experimentation platform). */
export type PaywallVariant = "A" | "B";

/** Why a softer re-offer of the paywall is being shown after the user previously closed it. */
export type ReofferReason = "task_completed" | "limit_hit" | "day7" | "day14";
