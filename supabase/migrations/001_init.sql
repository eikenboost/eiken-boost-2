-- Eiken Boost 2 initial schema
create extension if not exists pgcrypto;

create type plan_id as enum ('free', 'pro_monthly', 'pro_annual');
create type skill_type as enum ('vocab', 'reading', 'writing', 'speaking');
create type user_type as enum ('高校生', '大学生', '社会人', 'その他');
create type submission_status as enum ('queued', 'completed', 'failed');
create type credit_type as enum ('writing', 'speaking');

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text,
  exam_date date,
  user_type user_type not null default '高校生',
  weak_areas skill_type[] not null default '{}',
  daily_minutes int not null default 15,
  confidence_level text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  skill skill_type not null,
  duration_seconds int not null default 0,
  score numeric(5,2),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.vocab_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  vocab_key text not null,
  is_correct boolean not null,
  reviewed_at timestamptz not null default now(),
  next_review_at timestamptz,
  favorite boolean not null default false,
  explanation_seen boolean not null default true
);

create table if not exists public.writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  prompt_id text,
  prompt_text text not null,
  answer_text text not null,
  ai_score int,
  feedback jsonb,
  status submission_status not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.speaking_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  prompt_id text,
  prompt_text text not null,
  answer_text text,
  audio_path text,
  ai_score int,
  feedback jsonb,
  status submission_status not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id plan_id not null default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  credit_type credit_type not null,
  balance int not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, credit_type)
);

create table if not exists public.paywall_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  event_name text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.streaks (
  user_id uuid primary key references public.users(id) on delete cascade,
  current_streak int not null default 0,
  best_streak int not null default 0,
  last_study_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_vocab (
  id text primary key,
  word text not null,
  meaning_ja text not null,
  choices jsonb not null,
  answer text not null,
  explanation_ja text not null,
  tag text not null,
  level text not null default 'eiken_2'
);

create table if not exists public.content_reading (
  id text primary key,
  title text not null,
  topic text not null,
  difficulty text not null,
  passage text not null,
  questions jsonb not null,
  level text not null default 'eiken_2'
);

create table if not exists public.content_prompts (
  id text primary key,
  kind skill_type not null,
  prompt_text text not null,
  helper_text text,
  extra jsonb not null default '{}'::jsonb,
  level text not null default 'eiken_2'
);

alter table public.user_profiles enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.vocab_results enable row level security;
alter table public.writing_submissions enable row level security;
alter table public.speaking_submissions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.credit_balances enable row level security;
alter table public.paywall_events enable row level security;
alter table public.streaks enable row level security;

create policy "users own profile" on public.user_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own sessions" on public.learning_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own vocab results" on public.vocab_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own writing" on public.writing_submissions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own speaking" on public.speaking_submissions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own subscriptions" on public.subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own credits" on public.credit_balances for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own paywall events" on public.paywall_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own streaks" on public.streaks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_learning_sessions_user_id on public.learning_sessions(user_id, started_at desc);
create index if not exists idx_writing_submissions_user_id on public.writing_submissions(user_id, created_at desc);
create index if not exists idx_speaking_submissions_user_id on public.speaking_submissions(user_id, created_at desc);
create index if not exists idx_paywall_events_name on public.paywall_events(event_name, created_at desc);
