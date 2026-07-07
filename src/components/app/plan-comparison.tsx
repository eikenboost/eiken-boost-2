import { Check, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";

type ComparisonRow = {
  label: string;
  free: string | boolean;
  pro: string | boolean;
};

const rows: ComparisonRow[] = [
  { label: "今日のおすすめ自動作成", free: true, pro: true },
  { label: "単語・長文の学習量", free: "1日分のみ", pro: "使い放題" },
  { label: "英作文添削", free: "週1回", pro: "月12回" },
  { label: "面接練習", free: "週1回", pro: "月12回" },
  { label: "弱点分析", free: "簡易表示", pro: "詳細分析" },
  { label: "模試", free: false, pro: true },
  { label: "学習履歴の詳細表示", free: false, pro: true },
];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-emerald-600" />
    ) : (
      <Minus className="mx-auto h-4 w-4 text-slate-300" />
    );
  }
  return <span className="text-xs leading-5 text-slate-700">{value}</span>;
}

export function PlanComparison() {
  return (
    <Card className="rounded-[1.75rem]">
      <p className="text-sm font-semibold text-sky-700">Free と Pro のちがい</p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
        <div className="grid grid-cols-[1fr_64px_64px] items-center bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
          <span>できること</span>
          <span className="text-center">Free</span>
          <span className="text-center text-sky-700">Pro</span>
        </div>
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={`grid grid-cols-[1fr_64px_64px] items-center px-3 py-3 text-sm ${index % 2 === 1 ? "bg-slate-50/60" : ""}`}
          >
            <span className="pr-2 text-xs leading-5 text-slate-700">{row.label}</span>
            <span className="text-center"><Cell value={row.free} /></span>
            <span className="text-center"><Cell value={row.pro} /></span>
          </div>
        ))}
      </div>
    </Card>
  );
}
