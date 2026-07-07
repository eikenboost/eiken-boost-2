"use client";

import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type FinishTodayProps = {
  completedCount: number;
  onGoHome: () => void;
};

export function FinishToday({ completedCount, onGoHome }: FinishTodayProps) {
  return (
    <div className="mt-5">
      <Card className="rounded-[2rem] bg-slate-950 text-center text-white">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
          <PartyPopper className="h-7 w-7 text-amber-300" />
        </div>
        <h2 className="mt-4 text-2xl font-black">今日もよく頑張りました</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          今日は合計 <span className="text-xl font-black text-white">{completedCount}</span> 個のタスクを完了しました。
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          無理せず、また明日続けましょう。毎日の積み重ねが合格に近づく一番の近道です。
        </p>
        <div className="mt-6">
          <Button onClick={onGoHome} className="w-full justify-center">
            ホームに戻る
          </Button>
        </div>
      </Card>
    </div>
  );
}
