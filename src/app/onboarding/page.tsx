"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveStoredProfile } from "@/lib/app-state";

const weakAreaOptions = ["vocab", "reading", "writing", "speaking"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    examDate: "2026-10-12",
    userType: "高校生",
    availableMinutes: 15,
    confidence: "少し不安",
    weakAreas: ["writing", "speaking"],
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-10 pt-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Onboarding</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">あなた専用の15分プランを作ります</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">入力は1分で完了。今日やるべきことを自動で決めます。</p>

      <div className="mt-6 space-y-4">
        <Card className="rounded-[1.75rem]">
          <label className="text-sm font-semibold">受験予定日</label>
          <input
            type="date"
            value={form.examDate}
            onChange={(e) => setForm({ ...form, examDate: e.target.value })}
            className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4"
          />
        </Card>

        <Card className="rounded-[1.75rem]">
          <label className="text-sm font-semibold">学習者タイプ</label>
          <select
            value={form.userType}
            onChange={(e) => setForm({ ...form, userType: e.target.value })}
            className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4"
          >
            <option>高校生</option>
            <option>大学生</option>
            <option>社会人</option>
            <option>その他</option>
          </select>
        </Card>

        <Card className="rounded-[1.75rem]">
          <label className="text-sm font-semibold">苦手分野</label>
          <div className="mt-3 flex flex-wrap gap-2">
            {weakAreaOptions.map((area) => {
              const active = form.weakAreas.includes(area);
              return (
                <button
                  type="button"
                  key={area}
                  onClick={() =>
                    setForm({
                      ...form,
                      weakAreas: active ? form.weakAreas.filter((item) => item !== area) : [...form.weakAreas, area],
                    })
                  }
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  {area === "vocab" ? "単語" : area === "reading" ? "長文" : area === "writing" ? "英作文" : "面接"}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="rounded-[1.75rem]">
          <label className="text-sm font-semibold">1日に使える時間</label>
          <input
            type="range"
            min={10}
            max={30}
            step={5}
            value={form.availableMinutes}
            onChange={(e) => setForm({ ...form, availableMinutes: Number(e.target.value) })}
            className="mt-4 w-full"
          />
          <p className="mt-2 text-sm text-slate-500">{form.availableMinutes} 分 / 日</p>
        </Card>

        <Card className="rounded-[1.75rem]">
          <label className="text-sm font-semibold">今の自信度</label>
          <select
            value={form.confidence}
            onChange={(e) => setForm({ ...form, confidence: e.target.value })}
            className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4"
          >
            <option>かなり不安</option>
            <option>少し不安</option>
            <option>普通</option>
            <option>やや自信あり</option>
          </select>
        </Card>
      </div>

      <div className="mt-6">
        <Button
          className="w-full justify-between"
          onClick={() => {
            saveStoredProfile(form);
            router.push("/assessment");
          }}
        >
          実力チェックへ進む
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </main>
  );
}
