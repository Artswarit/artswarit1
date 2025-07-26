-- Create remaining tables and functions for Artswarit platform

-- Create enum types (skip if exists)
DO $$ BEGIN
    CREATE TYPE public.account_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.project_status AS ENUM ('pending', 'accepted', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.notification_type AS ENUM ('success', 'error', 'info', 'warning');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update profiles table to include account_status
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status account_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);

-- Create artwork_views table
CREATE TABLE IF NOT EXISTS public.artwork_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, artwork_id)
);

-- Update artworks table with approval_status
ALTER TABLE public.artworks 
ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'pending';

-- Enable RLS on artwork_views
ALTER TABLE public.artwork_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view artwork views" ON public.artwork_views;
DROP POLICY IF EXISTS "Users can create artwork views" ON public.artwork_views;

CREATE POLICY "Users can view artwork views" ON public.artwork_views
  FOR SELECT USING (true);

CREATE POLICY "Users can create artwork views" ON public.artwork_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update artworks policies for approval_status
DROP POLICY IF EXISTS "Artworks are viewable by everyone" ON public.artworks;
DROP POLICY IF EXISTS "Approved artworks are viewable by everyone" ON public.artworks;

CREATE POLICY "Approved artworks are viewable by everyone" ON public.artworks
  FOR SELECT USING (approval_status = 'approved' OR auth.uid() = artist_id);

-- Function to increment artwork views
CREATE OR REPLACE FUNCTION increment_artwork_views(artwork_uuid UUID, user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_view_count INTEGER;
BEGIN
  -- Insert view record if not exists
  INSERT INTO public.artwork_views (user_id, artwork_id)
  VALUES (user_uuid, artwork_uuid)
  ON CONFLICT (user_id, artwork_id) DO NOTHING;
  
  -- Update views count on artwork
  UPDATE public.artworks 
  SET views_count = views_count + 1 
  WHERE id = artwork_uuid 
  AND NOT EXISTS (
    SELECT 1 FROM public.artwork_views 
    WHERE user_id = user_uuid AND artwork_id = artwork_uuid
    AND created_at < now() - interval '1 minute'
  );
  
  -- Return current view count
  SELECT views_count INTO new_view_count FROM public.artworks WHERE id = artwork_uuid;
  RETURN new_view_count;
END;
$$;

-- Function to get artist stats
CREATE OR REPLACE FUNCTION get_artist_stats(artist_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_artworks', COALESCE((SELECT COUNT(*) FROM public.artworks WHERE artist_id = artist_uuid), 0),
    'approved_artworks', COALESCE((SELECT COUNT(*) FROM public.artworks WHERE artist_id = artist_uuid AND approval_status = 'approved'), 0),
    'total_views', COALESCE((SELECT SUM(views_count) FROM public.artworks WHERE artist_id = artist_uuid), 0),
    'total_likes', COALESCE((SELECT SUM(likes_count) FROM public.artworks WHERE artist_id = artist_uuid), 0),
    'total_followers', COALESCE((SELECT COUNT(*) FROM public.follows WHERE artist_id = artist_uuid), 0),
    'pending_projects', COALESCE((SELECT COUNT(*) FROM public.projects WHERE artist_id = artist_uuid AND status = 'pending'), 0)
  ) INTO stats;
  
  RETURN stats;
END;
$$;