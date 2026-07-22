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
3. `supabase/migrations/002_stripe_sync.sql` を実行（Stripe 連携に必須。`auth.users` → `public.users` 自動作成トリガーと、`subscriptions.user_id` の unique 制約を追加）
4. `supabase/seed.sql` を実行
5. `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
6. 本番運用では Service Role Key をサーバー側だけに配置

## Stripe セットアップ
1. Stripe で 2 つの subscription price と 2 つの credit pack price を作成
2. price ID を `.env.local` に設定
3. Stripe ダッシュボードで webhook endpoint を `<APP_URL>/api/stripe/webhook` に作成し、以下のイベントを購読:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. 発行された signing secret を `STRIPE_WEBHOOK_SECRET` に設定
5. Checkout Session 作成時にログイン中の Supabase ユーザー ID を `client_reference_id` / `metadata.supabase_user_id` として付与済み（`src/app/api/stripe/checkout/route.ts`）。未ログインの場合は決済前に `/login` へ誘導する
6. Webhook はこの ID を使って `subscriptions` / `credit_balances` テーブルを更新する（`src/app/api/stripe/webhook/route.ts`）
7. アプリの UI（ホーム / 設定 / 課金画面）はログイン中のユーザーについて Supabase の値を localStorage の表示用プロフィールに同期する（`src/lib/supabase/sync-profile.ts`）。デモモード（未ログイン・環境変数未設定）は従来どおり localStorage のみで完結する
8. カスタマーポータル（支払い方法変更・解約）は `/api/stripe/portal` から Stripe Customer Portal に遷移する（設定画面の「支払い・解約の管理」ボタン）

## AI セットアップ
- 互換 API を使う場合は `OPENAI_BASE_URL` を差し替えるだけで動きます
- `src/lib/ai.ts` で provider を一元管理しています
- API キー未設定時は厳しめのデモ添削を返します
- 本番環境は GenSpark の LLM Proxy（OpenAI 互換）を利用しています
  - `OPENAI_API_KEY`: GenSpark プロジェクトの「設定 > APIキー」で発行したキー
  - `OPENAI_BASE_URL=https://www.genspark.ai/api/llm_proxy/v1`
  - `OPENAI_MODEL=gpt-5-mini`（利用可能なモデルは `gpt-5` / `gpt-5-mini` / `gpt-5-nano` 系のみ）
  - 他の OpenAI 互換プロバイダ（例: 本物の OpenAI API）を使う場合は、上記 3 つの環境変数を差し替えるだけで切り替え可能です

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
