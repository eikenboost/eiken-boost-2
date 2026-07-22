import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { Card } from "@/components/ui/card";

const legalLinks = [
  { href: "/legal/tokushoho", label: "特定商取引法に基づく表記" },
  { href: "/legal/terms", label: "利用規約" },
  { href: "/legal/privacy", label: "プライバシーポリシー" },
];

export function LegalShell({
  title,
  updatedAt,
  currentHref,
  children,
}: {
  title: string;
  updatedAt: string;
  currentHref: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 pb-16 pt-6">
      <div className="flex items-center justify-between">
        <LogoMark />
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          トップへ戻る
        </Link>
      </div>

      <Card className="mt-8 rounded-[2rem]">
        <p className="text-sm font-semibold text-sky-700">Legal</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-2 text-xs text-slate-400">最終更新日: {updatedAt}</p>

        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-700 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:first:mt-0 [&_p]:leading-7 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_li]:leading-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border-b [&_td]:border-slate-100 [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_a]:text-sky-700 [&_a]:underline">
          {children}
        </div>
      </Card>

      <Card className="mt-4 rounded-[1.75rem] bg-slate-50">
        <p className="text-xs font-semibold text-slate-500">関連ページ</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.href === currentHref
                  ? "rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </Card>
    </main>
  );
}
