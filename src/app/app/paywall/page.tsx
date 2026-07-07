"use client";

import { useState } from "react";
import { ArrowRight, Check, Crown } from "lucide-react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { creditPacks, planCatalog } from "@/lib/plans";

async function startCheckout(kind: string) {
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
  });
  const data = await response.json();
  if (data.url) window.location.href = data.url;
}

export default function PaywallPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const plans = [planCatalog.pro_annual, planCatalog.pro_monthly, planCatalog.free];

  return (
    <MobileShell title="プラン" subtitle="年額プランをメインに、AIコストを守れる設計にしています。">
      <Card className="rounded-[1.75rem] bg-amber-50">
        <p className="text-sm font-semibold text-amber-800">あなたは英作文・面接が弱めです</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">AI添削と面接練習を使える回数が増えると、合格までの距離が一気に縮みます。</p>
      </Card>

      <div className="mt-5 space-y-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={`rounded-[2rem] ${plan.highlight ? "border-sky-500 bg-sky-600 text-white shadow-xl shadow-sky-200" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                {plan.highlight ? <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{plan.badge}</p> : null}
                <h2 className="mt-3 text-2xl font-black">{plan.name}</h2>
                <p className={`mt-2 text-sm ${plan.highlight ? "text-sky-100" : "text-slate-500"}`}>{plan.priceLabel}</p>
              </div>
              {plan.highlight ? <Crown className="h-6 w-6 text-amber-200" /> : null}
            </div>
            <ul className={`mt-5 space-y-3 text-sm ${plan.highlight ? "text-sky-50" : "text-slate-600"}`}>
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" />{feature}</li>
              ))}
            </ul>
            {plan.id !== "free" ? (
              <div className="mt-5">
                <Button
                  className={`w-full justify-between ${plan.highlight ? "bg-white text-sky-700 hover:bg-sky-50" : ""}`}
                  onClick={async () => {
                    setLoading(plan.id);
                    await startCheckout(plan.id);
                    setLoading(null);
                  }}
                >
                  {loading === plan.id ? "準備中..." : plan.highlight ? "年額ではじめる" : "月額ではじめる"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </Card>
        ))}
      </div>

      <Card className="mt-5 rounded-[1.75rem]">
        <p className="text-sm font-semibold text-sky-700">追加クレジット</p>
        <div className="mt-4 grid gap-3">
          {creditPacks.map((pack) => (
            <div key={pack.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{pack.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{pack.description}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    setLoading(pack.id);
                    await startCheckout(pack.id);
                    setLoading(null);
                  }}
                >
                  {loading === pack.id ? "準備中" : pack.priceLabel}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </MobileShell>
  );
}
