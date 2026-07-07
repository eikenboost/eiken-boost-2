"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveStoredAssessment } from "@/lib/app-state";
import type { AssessmentResult, Skill } from "@/lib/types";

const questions: { skill: Skill; q: string; choices: string[]; answer: number; selfCheck?: boolean }[] = [
  { skill: "vocab", q: "available に最も近い意味は？", choices: ["危険な", "利用できる", "静かな"], answer: 1 },
  { skill: "vocab", q: "improve the service の意味は？", choices: ["サービスを改善する", "サービスを止める", "サービスを比較する"], answer: 0 },
  { skill: "reading", q: "長文で最初に確認すべきものは？", choices: ["設問", "フォント", "作者名"], answer: 0 },
  { skill: "reading", q: "because の後ろで探しやすいのは？", choices: ["理由", "時刻", "場所"], answer: 0 },
  { skill: "writing", q: "英作文の1文目で最優先なのは？", choices: ["立場を明確にする", "難しい単語を使う", "長く書く"], answer: 0 },
  { skill: "writing", q: "80-100 words の英作文で良い構成は？", choices: ["主張→理由1→理由2→結論", "結論のみ", "例のみ"], answer: 0 },
  { skill: "speaking", q: "面接の答え方で安定する型は？", choices: ["結論→理由→例", "例だけ", "Yes/Noだけ"], answer: 0 },
  { skill: "speaking", q: "詰まった時に有効なのは？", choices: ["短い理由を足す", "黙る", "日本語で話す"], answer: 0 },
  { skill: "speaking", q: "自信はどれくらいありますか？", choices: ["かなり不安", "少し不安", "やや自信あり"], answer: 1, selfCheck: true },
  { skill: "writing", q: "英作文の苦手感は？", choices: ["かなりある", "少しある", "あまりない"], answer: 0, selfCheck: true },
] as const;

export default function AssessmentPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const completed = answers.filter((value) => value >= 0).length;

  const result = useMemo<AssessmentResult>(() => {
    const perSkill: Record<Skill, number> = { vocab: 0, reading: 0, writing: 0, speaking: 0 };
    const totals: Record<Skill, number> = { vocab: 0, reading: 0, writing: 0, speaking: 0 };

    questions.forEach((question, index) => {
      totals[question.skill as Skill] += 1;
      if (answers[index] === question.answer) perSkill[question.skill as Skill] += 1;
      if (question.selfCheck && answers[index] === 0) perSkill[question.skill as Skill] -= 0.4;
      if (question.selfCheck && answers[index] === 2) perSkill[question.skill as Skill] += 0.2;
    });

    const ranked = Object.entries(perSkill)
      .map(([skill, score]) => ({ skill: skill as Skill, ratio: score / totals[skill as Skill] }))
      .sort((a, b) => a.ratio - b.ratio);

    const weakAreas = ranked.slice(0, 3).map((item) => item.skill);
    const score = Math.max(40, Math.round((answers.filter((value, index) => value === questions[index].answer).length / questions.length) * 100));

    return {
      estimatedLevel: score >= 75 ? "2級合格圏。仕上げ期です" : score >= 60 ? "準2級〜2級の間。あと一歩" : "基礎固め優先。2級に向けて再設計",
      weakAreas,
      dailyPlan: [
        `${weakAreas[0] === "writing" ? "英作文" : weakAreas[0] === "speaking" ? "面接" : weakAreas[0] === "reading" ? "長文" : "単語"} 6分`,
        `${weakAreas[1] === "writing" ? "英作文" : weakAreas[1] === "speaking" ? "面接" : weakAreas[1] === "reading" ? "長文" : "単語"} 5分`,
        `${weakAreas[2] === "writing" ? "英作文" : weakAreas[2] === "speaking" ? "面接" : weakAreas[2] === "reading" ? "長文" : "単語"} 4分`,
      ],
      score,
    };
  }, [answers]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-10 pt-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Assessment</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">10問で今の実力をチェック</h1>
      <p className="mt-2 text-sm text-slate-500">完了 {completed} / {questions.length}</p>

      <div className="mt-6 space-y-4">
        {questions.map((question, index) => (
          <Card key={question.q} className="rounded-[1.5rem]">
            <p className="text-sm font-semibold text-sky-700">Q{index + 1}</p>
            <p className="mt-2 text-base font-semibold leading-7">{question.q}</p>
            <div className="mt-4 grid gap-2">
              {question.choices.map((choice, choiceIndex) => {
                const active = answers[index] === choiceIndex;
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setAnswers((current) => current.map((item, itemIndex) => (itemIndex === index ? choiceIndex : item)))}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm ${active ? "border-sky-600 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-700"}`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Button
          disabled={completed < questions.length}
          className="w-full justify-between"
          onClick={() => {
            saveStoredAssessment(result);
            router.push("/assessment/result");
          }}
        >
          結果を見る
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </main>
  );
}
