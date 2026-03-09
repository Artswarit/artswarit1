-- Exclusive memberships for Close Friends-style access
create table if not exists public.exclusive_memberships (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  rejected_at timestamptz,
  constraint exclusive_memberships_unique_pair unique (artist_id, client_id),
  constraint exclusive_memberships_status_check check (status in ('pending', 'approved', 'rejected'))
);

alter table public.exclusive_memberships enable row level security;

-- Artists can manage their exclusive circle
create policy "Artists manage their exclusive memberships"
  on public.exclusive_memberships
  for all
  using (auth.uid() = artist_id)
  with check (auth.uid() = artist_id);

-- Clients can view their membership status
create policy "Clients view their exclusive memberships"
  on public.exclusive_memberships
  for select
  using (auth.uid() = client_id);

-- Clients can request access (insert pending)
create policy "Clients request exclusive access"
  on public.exclusive_memberships
  for insert
  with check (auth.uid() = client_id and status = 'pending');

create index if not exists exclusive_memberships_artist_id_idx
  on public.exclusive_memberships (artist_id);

create index if not exists exclusive_memberships_client_id_idx
  on public.exclusive_memberships (client_id);

create index if not exists exclusive_memberships_status_idx
  on public.exclusive_memberships (status);
