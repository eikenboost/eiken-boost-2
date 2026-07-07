"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, LogOut, Trash2 } from "lucide-react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getStoredProfile, saveStoredProfile } from "@/lib/app-state";
import { mockProfile } from "@/lib/mock-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [profile, setProfile] = useState(() => (typeof window === "undefined" ? mockProfile : getStoredProfile()));
  const router = useRouter();

  const updateExamDate = (examDate: string) => {
    const next = { ...profile, examDate };
    setProfile(next);
    saveStoredProfile({ examDate });
  };

  return (
    <MobileShell title="設定" subtitle="プロフィール、受験日、プラン、クレジットを確認できます。">
      <div className="space-y-4">
        <Card className="rounded-[1.75rem]">
          <p className="text-sm font-semibold text-sky-700">プロフィール</p>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div><span className="font-semibold text-slate-800">学習者タイプ:</span> {profile.userType}</div>
            <div>
              <span className="font-semibold text-slate-800">受験日:</span>
              <input type="date" value={profile.examDate} onChange={(e) => updateExamDate(e.target.value)} className="ml-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" />
            </div>
            <div><span className="font-semibold text-slate-800">1日学習時間:</span> {profile.availableMinutes}分</div>
          </div>
        </Card>

        <Card className="rounded-[1.75rem] bg-slate-950 text-white">
          <div className="flex items-center gap-2 text-sm text-sky-200"><CreditCard className="h-4 w-4" />プラン情報</div>
          <p className="mt-3 text-2xl font-black">{profile.planId === "free" ? "Free" : profile.planId === "pro_monthly" ? "Pro Monthly" : "Pro Annual"}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/10 p-3">英作文クレジット<br /><span className="text-xl font-bold">{profile.credits.writing}</span></div>
            <div className="rounded-2xl bg-white/10 p-3">面接クレジット<br /><span className="text-xl font-bold">{profile.credits.speaking}</span></div>
          </div>
        </Card>

        <Card className="rounded-[1.75rem]">
          <div className="grid gap-3">
            <Button variant="secondary" onClick={() => router.push("/app/paywall")} className="w-full">プランを変更する</Button>
            <Button
              variant="ghost"
              onClick={async () => {
                const client = createSupabaseBrowserClient();
                await client?.auth.signOut();
                router.push("/");
              }}
              className="w-full justify-center text-slate-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              サインアウト
            </Button>
            <Button variant="ghost" className="w-full justify-center text-rose-600">
              <Trash2 className="mr-2 h-4 w-4" />
              アカウント削除
            </Button>
          </div>
        </Card>
      </div>
    </MobileShell>
  );
}
