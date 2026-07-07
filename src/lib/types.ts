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
