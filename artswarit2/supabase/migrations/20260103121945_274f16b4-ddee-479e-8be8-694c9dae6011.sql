-- 1) Helper: check if user participates in a project
create or replace function public.is_project_participant(project_uuid uuid, user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = project_uuid
      and (p.client_id = user_uuid or p.artist_id = user_uuid)
  );
$$;

-- 2) Project milestones
create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status text not null default 'pending',
  sort_order integer not null default 0,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.project_milestones enable row level security;

do $$ begin
  create policy "Participants can view project milestones"
  on public.project_milestones
  for select
  using (public.is_project_participant(project_id, auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Participants can create project milestones"
  on public.project_milestones
  for insert
  with check (
    public.is_project_participant(project_id, auth.uid())
    and created_by = auth.uid()
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Participants can update project milestones"
  on public.project_milestones
  for update
  using (public.is_project_participant(project_id, auth.uid()))
  with check (public.is_project_participant(project_id, auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Participants can delete project milestones"
  on public.project_milestones
  for delete
  using (public.is_project_participant(project_id, auth.uid()));
exception when duplicate_object then null; end $$;

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_project_milestones_updated_at'
  ) THEN
    CREATE TRIGGER trg_project_milestones_updated_at
    BEFORE UPDATE ON public.project_milestones
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

create index if not exists idx_project_milestones_project on public.project_milestones(project_id);

-- 3) Project files (metadata + storage path)
create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploader_id uuid not null,
  storage_bucket text not null default 'project-files',
  storage_path text not null,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

alter table public.project_files enable row level security;

do $$ begin
  create policy "Participants can view project files"
  on public.project_files
  for select
  using (public.is_project_participant(project_id, auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Participants can add project files"
  on public.project_files
  for insert
  with check (
    public.is_project_participant(project_id, auth.uid())
    and uploader_id = auth.uid()
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Participants can delete project files"
  on public.project_files
  for delete
  using (public.is_project_participant(project_id, auth.uid()));
exception when duplicate_object then null; end $$;

create index if not exists idx_project_files_project on public.project_files(project_id);

-- 4) Realtime (best-effort)
alter table public.project_milestones replica identity full;
alter table public.project_files replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.project_milestones;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.project_files;
exception when duplicate_object then null; end $$;

-- 5) Storage bucket for project files (private)
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;

-- 6) Storage policies: avatars bucket (fix avatar upload RLS)
DO $$ BEGIN
  create policy "Avatar images are publicly accessible"
  on storage.objects
  for select
  using (bucket_id = 'avatars');
exception when duplicate_object then null; end $$;

DO $$ BEGIN
  create policy "Users can upload their own avatar"
  on storage.objects
  for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
exception when duplicate_object then null; end $$;

DO $$ BEGIN
  create policy "Users can update their own avatar"
  on storage.objects
  for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
exception when duplicate_object then null; end $$;

DO $$ BEGIN
  create policy "Users can delete their own avatar"
  on storage.objects
  for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
exception when duplicate_object then null; end $$;

-- 7) Storage policies: project-files bucket (private, participant-only)
DO $$ BEGIN
  create policy "Project files are readable by participants"
  on storage.objects
  for select
  using (
    bucket_id = 'project-files'
    and public.is_project_participant(((storage.foldername(name))[2])::uuid, auth.uid())
  );
exception when duplicate_object then null; end $$;

DO $$ BEGIN
  create policy "Project participants can upload files"
  on storage.objects
  for insert
  with check (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
    and public.is_project_participant(((storage.foldername(name))[2])::uuid, auth.uid())
  );
exception when duplicate_object then null; end $$;

DO $$ BEGIN
  create policy "Project participants can update files"
  on storage.objects
  for update
  using (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
    and public.is_project_participant(((storage.foldername(name))[2])::uuid, auth.uid())
  )
  with check (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
    and public.is_project_participant(((storage.foldername(name))[2])::uuid, auth.uid())
  );
exception when duplicate_object then null; end $$;

DO $$ BEGIN
  create policy "Project participants can delete files"
  on storage.objects
  for delete
  using (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
    and public.is_project_participant(((storage.foldername(name))[2])::uuid, auth.uid())
  );
exception when duplicate_object then null; end $$;
