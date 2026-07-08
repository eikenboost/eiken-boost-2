-- Support Stripe webhook -> Supabase sync.
--
-- Two gaps existed before this migration:
-- 1. No `public.users` row was ever created when someone signed up via
--    Supabase Auth, so any FK-constrained insert (subscriptions,
--    credit_balances, ...) for a brand-new user would fail.
-- 2. `public.subscriptions.user_id` had no unique constraint, so the webhook
--    can't `upsert(..., { onConflict: "user_id" })` to keep exactly one
--    subscription row per user in sync.

-- 1. Auto-create a public.users row (and an empty profile) whenever someone
--    signs up through Supabase Auth, keeping our app tables in sync with
--    auth.users without every route having to remember to do it manually.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into public.user_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Backfill any auth users that already exist but have no public.users row.
insert into public.users (id, email)
select id, email from auth.users
on conflict (id) do nothing;

insert into public.user_profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- 2. One subscription row per user (the app only ever shows a single active
--    plan), so the webhook can safely upsert on user_id.
alter table public.subscriptions
  add constraint subscriptions_user_id_key unique (user_id);
