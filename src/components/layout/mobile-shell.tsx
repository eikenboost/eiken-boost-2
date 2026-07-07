import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";

export function MobileShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <header className="px-5 pb-3 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Eiken Boost 2</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
        </header>
        <main className="flex-1 px-4 pb-24">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
