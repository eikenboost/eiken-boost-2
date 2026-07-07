import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn("rounded-3xl border border-slate-200 bg-white p-5 shadow-sm", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
