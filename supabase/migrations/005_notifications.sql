create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  type         text not null check (type in ('new_message','new_match','profile_view')),
  from_user_id uuid references public.profiles(id) on delete set null,
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id, read, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "notifications_insert_service"
  on public.notifications for insert
  with check (true); -- service role inserts; app-level users can't self-insert

-- Enable Supabase Realtime for this table
alter publication supabase_realtime add table public.notifications;
