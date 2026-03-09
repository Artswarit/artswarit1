-- Enable REPLICA IDENTITY FULL for real-time updates on key tables
-- This ensures complete row data is captured during updates

ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.follows REPLICA IDENTITY FULL;
ALTER TABLE public.artwork_likes REPLICA IDENTITY FULL;
ALTER TABLE public.artwork_views REPLICA IDENTITY FULL;
ALTER TABLE public.project_reviews REPLICA IDENTITY FULL;
ALTER TABLE public.artworks REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication if not already added
DO $$
BEGIN
  -- Check and add profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;

  -- Check and add follows
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'follows'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
  END IF;

  -- Check and add artwork_likes
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'artwork_likes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.artwork_likes;
  END IF;

  -- Check and add artwork_views
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'artwork_views'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.artwork_views;
  END IF;

  -- Check and add project_reviews
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'project_reviews'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_reviews;
  END IF;

  -- Check and add artworks
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'artworks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.artworks;
  END IF;
END $$;