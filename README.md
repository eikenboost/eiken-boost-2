# Eiken Boost 2

英検2級に特化した、モバイルファーストの consumer learning app MVP です。

## 何が入っているか
- Next.js + TypeScript + Tailwind CSS
- モバイルファースト UI
- Welcome / Onboarding / Assessment / Home / Study / Analytics / Paywall / Settings
- Supabase 向け初期スキーマと seed SQL
- Stripe checkout / webhook の土台
- OpenAI-compatible API 抽象レイヤー
- デモモード fallback（環境変数未設定でも画面確認可能）

## セットアップ
```bash
npm install
cp .env.example .env.local
npm run dev
```

## 必須環境変数
`.env.example` を参照してください。

## Supabase セットアップ
1. Supabase プロジェクトを作成
2. `supabase/migrations/001_init.sql` を実行
3. `supabase/seed.sql` を実行
4. `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
5. 本番運用では Service Role Key をサーバー側だけに配置

## Stripe セットアップ
1. Stripe で 2 つの subscription price と 2 つの credit pack price を作成
2. price ID を `.env.local` に設定
3. webhook endpoint を `/api/stripe/webhook` に接続
4. checkout 完了後に Supabase へ同期する処理を webhook switch 内に追加

## AI セットアップ
- 互換 API を使う場合は `OPENAI_BASE_URL` を差し替えるだけで動きます
- `src/lib/ai.ts` で provider を一元管理しています
- API キー未設定時は厳しめのデモ添削を返します

## MVP 方針
- 最初の useful moment を最短化
- ホームから 2 タップ以内で学習開始
- UI は calm / modern / consumer 寄り
- まずは Eiken Grade 2 のみ対応

## デプロイ
Vercel 想定です。
- Environment Variables を設定
- `npm run build`
- deploy

## 今後の拡張
- 本番 Supabase 保存と usage tracking API 接続
- 音声録音 / 音声採点
- mock exam mode の拡張
- Day 7 / Day 14 paywall re-offer automation
