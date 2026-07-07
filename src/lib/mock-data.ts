import type {
  AssessmentResult,
  ReadingPassage,
  SpeakingPrompt,
  VocabQuestion,
  WritingPrompt,
} from "@/lib/types";

export const sampleVocab: VocabQuestion[] = [
  {
    id: "v1",
    word: "available",
    meaning: "利用できる",
    choices: ["危険な", "利用できる", "混雑した", "役に立たない"],
    answer: "利用できる",
    explanation: "available は『使える・空いている』の意味で、予定や席についてもよく使います。",
    tag: "日常表現",
  },
  {
    id: "v2",
    word: "environment",
    meaning: "環境",
    choices: ["環境", "意見", "経験", "産業"],
    answer: "環境",
    explanation: "environment は自然環境だけでなく、学習環境・職場環境にも使えます。",
    tag: "社会",
  },
  {
    id: "v3",
    word: "improve",
    meaning: "改善する",
    choices: ["繰り返す", "改善する", "許可する", "約束する"],
    answer: "改善する",
    explanation: "improve your English のように目的語を取って使います。",
    tag: "学習",
  },
  {
    id: "v4",
    word: "probably",
    meaning: "たぶん",
    choices: ["確実に", "たぶん", "ついに", "ゆっくり"],
    answer: "たぶん",
    explanation: "will probably は『おそらく〜するだろう』で頻出です。",
    tag: "副詞",
  },
  {
    id: "v5",
    word: "local",
    meaning: "地元の",
    choices: ["国際的な", "地元の", "危険な", "伝統的な"],
    answer: "地元の",
    explanation: "local shop / local event などの形でよく出ます。",
    tag: "生活",
  },
  {
    id: "v6",
    word: "suggest",
    meaning: "提案する",
    choices: ["説明する", "到着する", "提案する", "拒否する"],
    answer: "提案する",
    explanation: "suggest doing の形で使うことが多い単語です。",
    tag: "会話",
  },
];

export const sampleReading: ReadingPassage[] = [
  {
    id: "r1",
    title: "学校図書館の新しい使い方",
    topic: "school",
    difficulty: "標準",
    passage:
      "A high school library in Osaka changed its layout last year. Instead of keeping all desks in one area, the school created small study zones for different purposes. Some students now use the library before club activities, while others stay after school to prepare for tests. According to the librarian, the number of visitors has increased because students can choose a space that matches their needs.",
    questions: [
      {
        id: "r1q1",
        question: "Why has the number of visitors increased?",
        choices: [
          "The library is open all night.",
          "Students can choose a suitable space.",
          "Club activities were moved there.",
          "The library now offers free food.",
        ],
        answer: "Students can choose a suitable space.",
        explanation: "本文の最後に『needs に合う場所を選べるので利用者が増えた』とあります。",
      },
      {
        id: "r1q2",
        question: "What did the school change?",
        choices: [
          "It added more librarians.",
          "It moved the library to another building.",
          "It changed the layout of the desks.",
          "It shortened the opening hours.",
        ],
        answer: "It changed the layout of the desks.",
        explanation: "冒頭で layout を changed したと説明されています。",
      },
    ],
  },
  {
    id: "r2",
    title: "朝の散歩アプリ",
    topic: "health",
    difficulty: "基礎",
    passage:
      "Many office workers say they do not have enough time to exercise. A small company in Tokyo created an app that gives users short walking missions before work. For example, users may be asked to walk for ten minutes and take a photo of something blue. The company says the missions make exercise feel lighter and more fun.",
    questions: [
      {
        id: "r2q1",
        question: "Who mainly uses the app?",
        choices: ["Doctors", "Office workers", "Elementary school students", "Tourists"],
        answer: "Office workers",
        explanation: "冒頭で office workers が対象であることが示されています。",
      },
      {
        id: "r2q2",
        question: "Why do the missions help users?",
        choices: [
          "They reduce train fares.",
          "They make exercise more enjoyable.",
          "They let users study English.",
          "They improve camera skills.",
        ],
        answer: "They make exercise more enjoyable.",
        explanation: "lighter and more fun がヒントです。",
      },
    ],
  },
];

export const sampleWritingPrompts: WritingPrompt[] = [
  {
    id: "w1",
    prompt: "Do you think high school students should have a part-time job? Write about 80-100 words.",
    hint: "理由を2つに分けて、because / also を使うと整理しやすいです。",
  },
  {
    id: "w2",
    prompt: "Do you agree that people should study English from elementary school? Write about 80-100 words.",
    hint: "賛成・反対を最初の1文で明確にしましょう。",
  },
];

export const sampleSpeakingPrompts: SpeakingPrompt[] = [
  {
    id: "s1",
    prompt: "Please describe one good habit for staying healthy.",
    followUps: ["Why is it useful?", "How can students start this habit?"],
  },
  {
    id: "s2",
    prompt: "Do you think people should read news every day?",
    followUps: ["Why or why not?", "What kind of news is important for students?"],
  },
];

export const sampleAssessment: AssessmentResult = {
  estimatedLevel: "準2級〜2級の間。2級合格圏まであと一歩",
  weakAreas: ["writing", "speaking", "reading"],
  dailyPlan: [
    "単語 8分：苦手語を中心に10問",
    "長文 4分：標準レベルを1本",
    "ライティング 3分：構成メモを1題",
  ],
  score: 64,
};

export const weeklyProgress = [
  { day: "月", value: 12 },
  { day: "火", value: 15 },
  { day: "水", value: 18 },
  { day: "木", value: 10 },
  { day: "金", value: 16 },
  { day: "土", value: 20 },
  { day: "日", value: 14 },
];

export const skillBreakdown = [
  { skill: "単語", score: 76 },
  { skill: "長文", score: 68 },
  { skill: "英作文", score: 58 },
  { skill: "面接", score: 54 },
];

export const mockProfile = {
  name: "Yui",
  examDate: "2026-10-12",
  userType: "高校生",
  weakAreas: ["writing", "speaking"],
  confidence: "少し不安",
  availableMinutes: 15,
  streak: 8,
  planId: "free",
  usedWriting: 0,
  usedSpeaking: 0,
  credits: {
    writing: 1,
    speaking: 1,
  },
};
