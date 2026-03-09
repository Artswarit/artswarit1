-- Create all required tables for Artswarit platform

-- Create enum types
CREATE TYPE public.account_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.project_status AS ENUM ('pending', 'accepted', 'completed', 'cancelled');
CREATE TYPE public.notification_type AS ENUM ('success', 'error', 'info', 'warning');

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

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(10,2),
  deadline DATE,
  status project_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update artworks table
ALTER TABLE public.artworks 
ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'pending',
DROP COLUMN IF EXISTS is_featured CASCADE;

-- Enable RLS on all tables
ALTER TABLE public.artwork_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artwork_views
CREATE POLICY "Users can view artwork views" ON public.artwork_views
  FOR SELECT USING (true);

CREATE POLICY "Users can create artwork views" ON public.artwork_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Users can view their projects" ON public.projects
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = artist_id);

CREATE POLICY "Clients can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their projects" ON public.projects
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = artist_id);

-- Update artworks policies for approval_status
DROP POLICY IF EXISTS "Artworks are viewable by everyone" ON public.artworks;
CREATE POLICY "Approved artworks are viewable by everyone" ON public.artworks
  FOR SELECT USING (approval_status = 'approved' OR auth.uid() = artist_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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