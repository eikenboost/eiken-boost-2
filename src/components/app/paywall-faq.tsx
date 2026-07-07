"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "無料でも使えますか？",
    answer: "はい。単語・長文は無料プランのままずっと使えます。英作文添削と面接練習は回数が限られますが、まずは無料で試していただけます。",
  },
  {
    question: "年額のほうが向いている人は？",
    answer: "本気で英検2級合格を目指していて、英作文・面接をしっかり練習したい方に向いています。月額より1回あたりの負担が下がり、模試や詳細分析も使えます。",
  },
  {
    question: "途中で解約できますか？",
    answer: "はい、いつでも解約できます。解約しても、それまでの学習履歴やスコアはそのまま残ります。",
  },
  {
    question: "英作文や面接だけ使いたい場合は？",
    answer: "追加クレジット（回数パック）を都度購入することもできます。まずは無料プランや月額プランで様子を見るのもおすすめです。",
  },
];

export function PaywallFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Card className="rounded-[1.75rem]">
      <p className="text-sm font-semibold text-sky-700">よくある質問</p>
      <div className="mt-3 divide-y divide-slate-100">
        {faqs.map((faq, index) => {
          const open = openIndex === index;
          return (
            <div key={faq.question} className="py-3">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="text-sm font-semibold text-slate-800">{faq.question}</span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
              </button>
              {open ? <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p> : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
