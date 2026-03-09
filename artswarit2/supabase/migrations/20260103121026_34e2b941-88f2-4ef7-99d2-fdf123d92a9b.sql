-- Enable realtime for tables used by dashboards/settings
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.saved_artists REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add tables to the realtime publication (idempotent guards)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'saved_artists'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_artists;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END
$$;

-- Allow users to create their own row in public.users if it's missing (fixes follow/projects FK issues)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can insert their own user row'
  ) THEN
    CREATE POLICY "Users can insert their own user row"
    ON public.users
    FOR INSERT
    TO public
    WITH CHECK (auth.uid() = id);
  END IF;
END
$$;