-- Conversations (metadata only — messages are P2P via Trystero)
create table public.conversations (
  id               uuid primary key default gen_random_uuid(),
  participant_ids  uuid[]       not null,
  last_message     text,
  last_message_at  timestamptz,
  created_at       timestamptz  not null default now(),
  -- Ensure exactly 2 participants and no duplicates
  constraint exactly_two_participants check (array_length(participant_ids, 1) = 2),
  constraint unique_participants unique (participant_ids)
);

create index idx_conversations_participants on public.conversations using gin(participant_ids);

-- Blocks
create table public.blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid not null references public.profiles(id) on delete cascade,
  blocked_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(blocker_id, blocked_id)
);

-- Reports
create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  reported_id  uuid not null references public.profiles(id) on delete cascade,
  reason       text not null check (length(reason) <= 100),
  details      text check (length(details) <= 1000),
  status       text not null default 'pending' check (status in ('pending','reviewed','actioned')),
  created_at   timestamptz not null default now()
);
