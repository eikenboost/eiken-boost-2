import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-3xl border border-slate-200 bg-white p-5 shadow-sm", className)}>{children}</div>;
}
