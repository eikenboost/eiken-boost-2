"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TaskCompletion } from "@/components/app/task-completion";
import { FinishToday } from "@/components/app/finish-today";
import { getWritingPrompt, coachComment as buildCoachComment } from "@/lib/study-flow";
import { useTaskFlow } from "@/lib/use-task-flow";
import { hasHitFreeLimit } from "@/lib/paywall";
import type { WritingFeedback } from "@/lib/types";

function WritingPageInner() {
  const router = useRouter();
  const flow = useTaskFlow("writing");
  const prompt = useMemo(() => getWritingPrompt(flow.params.contentIndex), [flow.params.contentIndex]);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [loading, setLoading] = useState(false);

  const limitReached = hasHitFreeLimit(flow.profile.planId, flow.profile.usedWriting, flow.profile.usedSpeaking);

  const submit = async () => {
    if (limitReached) {
      router.push("/app/paywall");
      return;
    }
    setLoading(true);
    const response = await fetch("/api/ai/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "writing", prompt: prompt.prompt, answer }),
    });
    const data = await response.json();
    setFeedback(data);
    setLoading(false);
  };

  const handleComplete = () => {
    if (!feedback) return;
    flow.complete(feedback.score, `英作文の添削が完了しました。スコアは ${feedback.score} 点です。`);
  };

  if (flow.phase === "finished") {
    return (
      <MobileShell title="英作文添削" subtitle="今日もお疲れさまでした。">
        <FinishToday completedCount={flow.todaysCompletedCount} onGoHome={flow.goHome} />
      </MobileShell>
    );
  }

  if (flow.phase === "completion") {
    return (
      <MobileShell title="英作文添削" subtitle="日本語で短く、でも厳しくフィードバックします。">
        <TaskCompletion
          skill="writing"
          source={flow.params.source}
          score={flow.score}
          summary={flow.summary}
          coachComment={buildCoachComment("writing", flow.score)}
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
    <MobileShell title="英作文添削" subtitle="日本語で短く、でも厳しくフィードバックします。">
      <Card className="rounded-[2rem] bg-amber-50">
        <p className="text-sm font-semibold text-amber-800">本日のお題</p>
        <h2 className="mt-2 text-lg font-bold leading-7">{prompt.prompt}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">ヒント: {prompt.hint}</p>
      </Card>

      {limitReached ? (
        <Card className="mt-5 rounded-[1.75rem] bg-rose-50">
          <p className="text-sm font-semibold text-rose-700">今週の無料添削回数を使い切りました</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Proなら英作文添削をもっと使えます。続けたい気持ちを、そのまま学習に変えましょう。</p>
          <Button onClick={() => router.push("/app/paywall")} className="mt-4 w-full justify-center">
            プランを見る
          </Button>
        </Card>
      ) : (
        <Card className="mt-5 rounded-[1.75rem]">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={10}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 outline-none"
            placeholder="80〜100語を目安に入力してください"
          />
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
            <span>履歴比較は Supabase に保存可能</span>
          </div>
          <div className="mt-4">
            <Button onClick={submit} disabled={loading || answer.trim().length < 20} className="w-full justify-center">
              {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              添削を受ける
            </Button>
          </div>
        </Card>
      )}

      {feedback ? (
        <div className="mt-5 space-y-4">
          <Card className="rounded-[1.75rem] bg-slate-950 text-white">
            <p className="text-sm text-sky-300">スコア</p>
            <p className="mt-2 text-4xl font-black">{feedback.score}</p>
            <p className="mt-2 text-sm text-slate-300">{feedback.coachComment}</p>
          </Card>
          <Card className="rounded-[1.75rem]"><p className="font-semibold">文法</p><ul className="mt-3 space-y-2 text-sm text-slate-600">{feedback.grammarFeedback.map((item) => <li key={item}>・{item}</li>)}</ul></Card>
          <Card className="rounded-[1.75rem]"><p className="font-semibold">構成</p><ul className="mt-3 space-y-2 text-sm text-slate-600">{feedback.structureFeedback.map((item) => <li key={item}>・{item}</li>)}</ul></Card>
          <Card className="rounded-[1.75rem]"><p className="font-semibold">語彙</p><ul className="mt-3 space-y-2 text-sm text-slate-600">{feedback.vocabFeedback.map((item) => <li key={item}>・{item}</li>)}</ul></Card>
          <Card className="rounded-[1.75rem] bg-sky-50"><p className="font-semibold">改善例</p><p className="mt-3 text-sm leading-7 text-slate-700">{feedback.improvedAnswer}</p></Card>
          <Button onClick={handleComplete} className="w-full justify-center">この添削を完了する</Button>
        </div>
      ) : null}
    </MobileShell>
  );
}

export default function WritingPage() {
  return (
    <Suspense fallback={null}>
      <WritingPageInner />
    </Suspense>
  );
}
