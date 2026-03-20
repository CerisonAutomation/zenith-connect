-- ============================================================
-- Row Level Security policies
-- ============================================================

-- PROFILES
alter table public.profiles enable row level security;

create policy "profiles_select_public"
  on public.profiles for select
  using (
    -- Block list check: can't see blocked/blocking users
    not exists (
      select 1 from public.blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = profiles.id)
         or (b.blocker_id = profiles.id and b.blocked_id = auth.uid())
    )
  );

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- CONVERSATIONS
alter table public.conversations enable row level security;

create policy "conversations_select_participant"
  on public.conversations for select
  using (auth.uid() = any(participant_ids));

create policy "conversations_insert_participant"
  on public.conversations for insert
  with check (auth.uid() = any(participant_ids));

create policy "conversations_update_participant"
  on public.conversations for update
  using (auth.uid() = any(participant_ids));

-- BLOCKS
alter table public.blocks enable row level security;

create policy "blocks_select_own"
  on public.blocks for select
  using (auth.uid() = blocker_id);

create policy "blocks_insert_own"
  on public.blocks for insert
  with check (auth.uid() = blocker_id);

create policy "blocks_delete_own"
  on public.blocks for delete
  using (auth.uid() = blocker_id);

-- REPORTS
alter table public.reports enable row level security;

create policy "reports_insert_own"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "reports_select_own"
  on public.reports for select
  using (auth.uid() = reporter_id);
