"use client";

import { useState } from "react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SkillPill } from "@/components/ui/skill-pill";
import { sampleReading } from "@/lib/mock-data";

export default function ReadingPage() {
  const passage = sampleReading[0];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const completed = Object.keys(answers).length === passage.questions.length;

  return (
    <MobileShell title="長文トレーニング" subtitle="短い本文を読み、2〜3問で理解を確認します。">
      <Card className="rounded-[2rem]">
        <div className="flex items-center gap-2">
          <SkillPill tone="emerald">{passage.difficulty}</SkillPill>
          <SkillPill>{passage.topic}</SkillPill>
        </div>
        <h2 className="mt-3 text-xl font-bold">{passage.title}</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">{passage.passage}</p>
      </Card>

      <div className="mt-5 space-y-4">
        {passage.questions.map((question, questionIndex) => (
          <Card key={question.id} className="rounded-[1.75rem]">
            <p className="text-sm font-semibold text-sky-700">Q{questionIndex + 1}</p>
            <p className="mt-2 text-sm font-semibold leading-6">{question.question}</p>
            <div className="mt-4 grid gap-2">
              {question.choices.map((choice) => {
                const active = answers[question.id] === choice;
                return (
                  <button
                    type="button"
                    key={choice}
                    onClick={() => setAnswers((current) => ({ ...current, [question.id]: choice }))}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm ${active ? "border-sky-600 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-700"}`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
            {completed ? (
              <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                <p className="font-semibold text-slate-800">正解: {question.answer}</p>
                <p className="mt-1">{question.explanation}</p>
              </div>
            ) : null}
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Button className="w-full" disabled={!completed}>この長文を完了</Button>
      </div>
    </MobileShell>
  );
}
