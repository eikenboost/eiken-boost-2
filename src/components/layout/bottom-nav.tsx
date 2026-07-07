"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, Home, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app", label: "ホーム", icon: Home },
  { href: "/app/analytics", label: "分析", icon: BarChart3 },
  { href: "/app/paywall", label: "プラン", icon: CreditCard },
  { href: "/app/settings", label: "設定", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 mt-8 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium text-slate-500 transition",
                active && "bg-sky-50 text-sky-700",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="pointer-events-none absolute right-5 top-3 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800">
        <Sparkles className="h-3 w-3" />
        15分メニュー
      </div>
    </nav>
  );
}
