"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Heart, RotateCcw, XCircle } from "lucide-react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sampleVocab } from "@/lib/mock-data";

export default function VocabPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const question = sampleVocab[index];
  const correct = selected === question.answer;
  const completed = selected !== null;
  const reviewWords = useMemo(() => sampleVocab.filter((item) => item.answer !== selected && item.id === question.id), [question.id, selected]);

  return (
    <MobileShell title="単語トレーニング" subtitle="1問ずつ、すぐに正解と解説を確認できます。">
      <Card className="rounded-[2rem] bg-sky-600 text-white">
        <p className="text-sm text-sky-100">問題 {index + 1} / {sampleVocab.length}</p>
        <h2 className="mt-2 text-3xl font-black">{question.word}</h2>
        <p className="mt-2 text-sm text-sky-100">タグ: {question.tag}</p>
      </Card>

      <div className="mt-5 grid gap-3">
        {question.choices.map((choice) => (
          <button
            key={choice}
            type="button"
            disabled={completed}
            onClick={() => setSelected(choice)}
            className={`rounded-[1.5rem] border px-4 py-4 text-left text-sm font-medium ${selected === choice ? choice === question.answer ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50" : "border-slate-200 bg-white"}`}
          >
            {choice}
          </button>
        ))}
      </div>

      {completed ? (
        <Card className="mt-5 rounded-[1.75rem]">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {correct ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-rose-600" />}
            {correct ? "正解" : "もう一度見直そう"}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{question.explanation}</p>
          {!correct ? <p className="mt-2 text-sm font-semibold text-slate-700">正解: {question.answer}</p> : null}
          <div className="mt-4 flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setFavorites((current) => (current.includes(question.id) ? current : [...current, question.id]))}
              className="flex-1 justify-center"
            >
              <Heart className="mr-2 h-4 w-4" />
              苦手保存
            </Button>
            <Button
              onClick={() => {
                setSelected(null);
                setIndex((current) => (current + 1) % sampleVocab.length);
              }}
              className="flex-1 justify-center"
            >
              次へ
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="mt-5 rounded-[1.75rem] bg-slate-950 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <RotateCcw className="h-4 w-4" />
          間違えた単語はあとで再出題
        </div>
        <p className="mt-2 text-sm text-slate-300">このMVPでは、苦手保存した単語と誤答を復習キューに入れる設計です。現在の候補: {favorites.length + reviewWords.length}件</p>
      </Card>
    </MobileShell>
  );
}
