"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("デモモードでもすぐ試せます。");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signIn = async () => {
    const client = createSupabaseBrowserClient();
    if (!client) {
      router.push("/onboarding");
      return;
    }

    setLoading(true);
    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    setMessage(error ? "ログインリンクの送信に失敗しました。" : "メールを送信しました。リンクを開いて続けてください。");
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-10 pt-6">
      <LogoMark />
      <Card className="mt-8 rounded-[2rem]">
        <p className="text-sm font-semibold text-sky-700">スタート</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">無料ではじめる</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Supabase を設定するとメールリンク認証が動作します。未設定でもデモで全画面を確認できます。</p>

        <div className="mt-6 space-y-3">
          <label className="block text-sm font-medium text-slate-700">メールアドレス</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none ring-0"
            placeholder="you@example.com"
            type="email"
          />
          <Button onClick={signIn} disabled={loading || !email} className="w-full justify-between">
            ログインリンクを送る
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={() => router.push("/onboarding")} className="w-full justify-between">
            デモで続ける
            <Sparkles className="h-4 w-4" />
          </Button>
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">{message}</p>
        </div>
      </Card>
    </main>
  );
}
