import { cn } from "@/lib/utils";

export function SkillPill({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "amber" | "emerald"; }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tone === "blue" && "bg-sky-100 text-sky-700",
        tone === "amber" && "bg-amber-100 text-amber-800",
        tone === "emerald" && "bg-emerald-100 text-emerald-700",
      )}
    >
      {children}
    </span>
  );
}
