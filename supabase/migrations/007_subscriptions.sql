-- Subscription tracking (Stripe webhook populates this)
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid unique not null references public.profiles(id) on delete cascade,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  status                  text not null default 'inactive'
                          check (status in ('active','cancelled','paused','past_due','inactive')),
  plan                    text not null default 'free' check (plan in ('free','premium')),
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Service role only for insert/update (webhook)
create policy "subscriptions_service_write"
  on public.subscriptions for all
  using (auth.role() = 'service_role');

-- Add profile fields for new settings
alter table public.profiles
  add column if not exists show_distance    boolean not null default true,
  add column if not exists incognito_mode   boolean not null default false,
  add column if not exists notif_messages   boolean not null default true,
  add column if not exists notif_views      boolean not null default false;
