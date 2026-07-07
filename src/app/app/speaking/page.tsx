"use client";

import { Suspense, useMemo, useState } from "react";
import { LoaderCircle, Mic, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TaskCompletion } from "@/components/app/task-completion";
import { FinishToday } from "@/components/app/finish-today";
import { getSpeakingPrompt, coachComment as buildCoachComment } from "@/lib/study-flow";
import { useTaskFlow } from "@/lib/use-task-flow";
import type { SpeakingFeedback } from "@/lib/types";

function SpeakingPageInner() {
  const flow = useTaskFlow("speaking");
  const prompt = useMemo(() => getSpeakingPrompt(flow.params.contentIndex), [flow.params.contentIndex]);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const response = await fetch("/api/ai/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "speaking", prompt: `${prompt.prompt}\nFollow-ups: ${prompt.followUps.join(" / ")}`, answer }),
    });
    const data = await response.json();
    setFeedback(data);
    setLoading(false);
  };

  const handleComplete = () => {
    if (!feedback) return;
    flow.complete(feedback.score, `面接練習が完了しました。総合評価は ${feedback.score} 点です。`);
  };

  if (flow.phase === "finished") {
    return (
      <MobileShell title="面接練習" subtitle="今日もお疲れさまでした。">
        <FinishToday completedCount={flow.todaysCompletedCount} onGoHome={flow.goHome} />
      </MobileShell>
    );
  }

  if (flow.phase === "completion") {
    return (
      <MobileShell title="面接練習" subtitle="MVPではテキスト入力中心。音声UIは後から追加しやすい構成です。">
        <TaskCompletion
          skill="speaking"
          source={flow.params.source}
          score={flow.score}
          summary={flow.summary}
          coachComment={buildCoachComment("speaking", flow.score)}
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
    <MobileShell title="面接練習" subtitle="MVPではテキスト入力中心。音声UIは後から追加しやすい構成です。">
      <Card className="rounded-[2rem] bg-violet-50">
        <p className="text-sm font-semibold text-violet-700">質問</p>
        <h2 className="mt-2 text-lg font-bold leading-7">{prompt.prompt}</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {prompt.followUps.map((item) => <li key={item}>・{item}</li>)}
        </ul>
      </Card>

      <Card className="mt-5 rounded-[1.75rem]">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Mic className="h-4 w-4 text-violet-700" />
          答えを英語で入力
        </div>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={8}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 outline-none"
          placeholder="結論 → 理由 → 例 の3文を目安に入力"
        />
        <div className="mt-4">
          <Button onClick={submit} disabled={loading || answer.trim().length < 12} className="w-full justify-center">
            {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            フィードバックを受ける
          </Button>
        </div>
      </Card>

      {feedback ? (
        <div className="mt-5 space-y-4">
          <Card className="rounded-[1.75rem] bg-slate-950 text-white">
            <p className="text-sm text-violet-300">総合評価</p>
            <p className="mt-2 text-4xl font-black">{feedback.score}</p>
            <p className="mt-2 text-sm text-slate-300">{feedback.coachComment}</p>
          </Card>
          <Card className="rounded-[1.75rem]"><p className="font-semibold">答え方の改善点</p><ul className="mt-3 space-y-2 text-sm text-slate-600">{feedback.qualityFeedback.map((item) => <li key={item}>・{item}</li>)}</ul></Card>
          <Card className="rounded-[1.75rem]"><p className="font-semibold">自然な言い換え</p><ul className="mt-3 space-y-2 text-sm text-slate-600">{feedback.naturalPhrasing.map((item) => <li key={item}>・{item}</li>)}</ul></Card>
          <Card className="rounded-[1.75rem] bg-violet-50"><p className="font-semibold">強いサンプル回答</p><p className="mt-3 text-sm leading-7 text-slate-700">{feedback.sampleAnswer}</p></Card>
          <Button onClick={handleComplete} className="w-full justify-center">この練習を完了する</Button>
        </div>
      ) : null}
    </MobileShell>
  );
}

export default function SpeakingPage() {
  return (
    <Suspense fallback={null}>
      <SpeakingPageInner />
    </Suspense>
  );
}
