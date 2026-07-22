import Link from "next/link";
import { ArrowRight, BookOpen, MessageSquareQuote, Mic, Sparkles, Target } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkillPill } from "@/components/ui/skill-pill";

const features = [
  {
    icon: BookOpen,
    title: "今日やることを自動提案",
    text: "単語・長文・英作文・面接から、その日の15分に最適な3タスクを表示。",
  },
  {
    icon: MessageSquareQuote,
    title: "英作文は短く、厳しく、実戦的に",
    text: "スコア、文法、構成、語彙、改善例まで日本語で返します。",
  },
  {
    icon: Mic,
    title: "面接練習も怖くない",
    text: "2次試験の質問形式で、答え方の型をやさしく定着。",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-10 pt-6">
      <LogoMark />

      <section className="mt-8 rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-2xl shadow-slate-300">
        <SkillPill tone="blue">英検2級専用MVP</SkillPill>
        <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight">
          1日15分で、
          <br />
          英検2級に近づく。
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Eiken Boost 2 は、ひとり学習でも迷わないように作られた英検2級専用の学習コーチです。
        </p>
        <div className="mt-6 grid gap-3">
          <Link href="/login">
            <Button className="w-full justify-between">
              無料ではじめる
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/assessment">
            <Button variant="secondary" className="w-full justify-between">
              実力チェックを受ける
              <Target className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="rounded-[1.75rem]">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">{feature.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{feature.text}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="mt-6 rounded-[1.75rem] bg-sky-50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sky-700">プロダクト約束</p>
            <h2 className="mt-1 text-xl font-bold">Pass Eiken Grade 2 with 15 minutes a day.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              最短導線で初回価値に到達。60秒以内に実力チェック、2タップで学習開始。
            </p>
          </div>
          <div className="rounded-2xl bg-white p-3 text-sky-600 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </Card>

      <footer className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-400">
        <Link href="/legal/tokushoho" className="underline hover:text-slate-600">
          特定商取引法に基づく表記
        </Link>
        <Link href="/legal/terms" className="underline hover:text-slate-600">
          利用規約
        </Link>
        <Link href="/legal/privacy" className="underline hover:text-slate-600">
          プライバシーポリシー
        </Link>
      </footer>
    </main>
  );
}
