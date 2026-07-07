"use client";

import { Suspense, useMemo, useState } from "react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SkillPill } from "@/components/ui/skill-pill";
import { TaskCompletion } from "@/components/app/task-completion";
import { FinishToday } from "@/components/app/finish-today";
import { getReadingPassage, coachComment as buildCoachComment } from "@/lib/study-flow";
import { useTaskFlow } from "@/lib/use-task-flow";

function ReadingPageInner() {
  const flow = useTaskFlow("reading");
  const passage = useMemo(() => getReadingPassage(flow.params.contentIndex), [flow.params.contentIndex]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const completed = Object.keys(answers).length === passage.questions.length;

  const handleComplete = () => {
    const correctCount = passage.questions.filter((q) => answers[q.id] === q.answer).length;
    const score = Math.round((correctCount / passage.questions.length) * 100);
    flow.complete(score, `長文「${passage.title}」で ${passage.questions.length} 問中 ${correctCount} 問正解でした。`);
  };

  if (flow.phase === "finished") {
    return (
      <MobileShell title="長文トレーニング" subtitle="今日もお疲れさまでした。">
        <FinishToday completedCount={flow.todaysCompletedCount} onGoHome={flow.goHome} />
      </MobileShell>
    );
  }

  if (flow.phase === "completion") {
    return (
      <MobileShell title="長文トレーニング" subtitle="短い本文を読み、2〜3問で理解を確認します。">
        <TaskCompletion
          skill="reading"
          source={flow.params.source}
          score={flow.score}
          summary={flow.summary}
          coachComment={buildCoachComment("reading", flow.score)}
          nextButtonLabel={flow.nextButtonLabel}
          onNextRecommended={flow.goNextRecommended}
          onRepeatSame={flow.goRepeatSame}
          onGoHome={flow.goHome}
          onFinishToday={flow.finishToday}
        />
      </MobileShell>
    );
  }

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
        <Button onClick={handleComplete} className="w-full" disabled={!completed}>この長文を完了</Button>
      </div>
    </MobileShell>
  );
}

export default function ReadingPage() {
  return (
    <Suspense fallback={null}>
      <ReadingPageInner />
    </Suspense>
  );
}
