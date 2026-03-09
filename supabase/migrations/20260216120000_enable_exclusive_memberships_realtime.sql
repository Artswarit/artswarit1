-- Enable Realtime for exclusive_memberships so client UIs update instantly
ALTER TABLE public.exclusive_memberships REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'exclusive_memberships'
  ) THEN
    ALTER PUBLICATION supabase_realtime
      ADD TABLE public.exclusive_memberships;
  END IF;
END $$;

