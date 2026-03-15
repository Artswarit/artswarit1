
-- Enable realtime for subscribers table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'subscribers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subscribers;
  END IF;
END $$;
