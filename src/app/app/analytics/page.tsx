import { MobileShell } from "@/components/layout/mobile-shell";
import { WeeklyMinutesChart, SkillTrendChart } from "@/components/app/analytics-charts";
import { Card } from "@/components/ui/card";
import { skillBreakdown, weeklyProgress } from "@/lib/mock-data";

export default function AnalyticsPage() {
  return (
    <MobileShell title="学習分析" subtitle="複雑にしすぎず、次にやるべきことが分かる分析だけを表示。">
      <Card className="rounded-[1.75rem]">
        <p className="text-sm font-semibold text-sky-700">今週の学習時間</p>
        <h2 className="mt-2 text-xl font-bold">継続はできています</h2>
        <p className="mt-2 text-sm text-slate-500">土日に伸びています。平日は5分でも開始するのがコツです。</p>
        <div className="mt-4"><WeeklyMinutesChart data={weeklyProgress} /></div>
      </Card>

      <Card className="mt-5 rounded-[1.75rem]">
        <p className="text-sm font-semibold text-sky-700">技能別スコア</p>
        <h2 className="mt-2 text-xl font-bold">英作文と面接を優先</h2>
        <div className="mt-4"><SkillTrendChart data={skillBreakdown} /></div>
      </Card>

      <div className="mt-5 space-y-4">
        <Card className="rounded-[1.75rem] bg-amber-50">
          <p className="text-sm font-semibold text-amber-800">今週の重点</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">英作文は理由の肉付け、面接は最初の1文の安定化。今週はこの2点だけに集中すると伸びやすいです。</p>
        </Card>
        <Card className="rounded-[1.75rem]">
          <p className="text-sm font-semibold text-sky-700">簡易サマリー</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>・単語は定着率が高く、毎日5分で維持できています。</li>
            <li>・長文は正答率は悪くないですが、設問先読みをもっと徹底したいです。</li>
            <li>・AI添削を使うと、英作文の改善スピードが大きく上がります。</li>
          </ul>
        </Card>
      </div>
    </MobileShell>
  );
}
