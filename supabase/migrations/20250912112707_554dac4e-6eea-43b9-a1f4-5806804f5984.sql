-- Fix Security Definer View issue by recreating public_profiles view without SECURITY DEFINER
-- and ensuring proper RLS policies

-- Drop the existing view that might have SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Recreate the view without SECURITY DEFINER (default behavior)
CREATE VIEW public.public_profiles AS
SELECT 
  profiles.id,
  profiles.full_name,
  profiles.avatar_url,
  profiles.role,
  profiles.bio,
  profiles.location,
  profiles.website,
  profiles.social_links,
  profiles.is_verified,
  profiles.created_at,
  profiles.tags,
  profiles.portfolio_url,
  profiles.experience_years,
  profiles.hourly_rate,
  profiles.account_status
FROM profiles
WHERE profiles.account_status = 'approved';

-- Enable RLS on the view (this will use the underlying table's RLS policies)
ALTER VIEW public.public_profiles SET (security_barrier = on);

-- Create RLS policies for the view to ensure proper access control
-- These policies will be checked in addition to the underlying table's policies

-- Allow authenticated users to select from public_profiles
CREATE POLICY "Authenticated users can view public profiles"
ON public.public_profiles
FOR SELECT
TO authenticated
USING (true);

-- Allow anonymous users to view public profiles (for public browsing)
CREATE POLICY "Anonymous users can view public profiles"
ON public.public_profiles
FOR SELECT
TO anon
USING (true);

-- Also fix search_path for any functions that don't have it set properly
-- Update increment_artwork_views function
CREATE OR REPLACE FUNCTION public.increment_artwork_views(artwork_uuid uuid, user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update get_artist_stats function
CREATE OR REPLACE FUNCTION public.get_artist_stats(artist_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update record_artwork_sale function
CREATE OR REPLACE FUNCTION public.record_artwork_sale(artwork_uuid uuid, buyer_uuid uuid, sale_amount numeric)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  sale_id UUID;
  artwork_artist_id UUID;
BEGIN
  -- Get artist_id from artwork
  SELECT artist_id INTO artwork_artist_id FROM public.artworks WHERE id = artwork_uuid;
  
  -- Insert sale record
  INSERT INTO public.sales (artwork_id, artist_id, buyer_id, amount)
  VALUES (artwork_uuid, artwork_artist_id, buyer_uuid, sale_amount)
  RETURNING id INTO sale_id;
  
  -- Create notification for artist
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    artwork_artist_id,
    'New Sale!',
    'Your artwork has been sold for $' || sale_amount,
    'success'
  );
  
  RETURN sale_id;
END;
$function$;

-- Update update_artwork_likes_count function
CREATE OR REPLACE FUNCTION public.update_artwork_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.artworks SET likes_count = likes_count + 1 WHERE id = NEW.artwork_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.artworks SET likes_count = likes_count - 1 WHERE id = OLD.artwork_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Update is_admin function  
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  );
$function$;

-- Update auto_upgrade_premium function
CREATE OR REPLACE FUNCTION public.auto_upgrade_premium()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.is_active AND NEW.subscription_tier IS NOT NULL THEN
    UPDATE public.profiles SET role = 'premium' WHERE id = NEW.user_id;
  ELSIF NOT NEW.is_active THEN
    -- Downgrade to regular user if subscription becomes inactive
    UPDATE public.profiles SET role = 'artist' WHERE id = NEW.user_id AND role = 'premium';
  END IF;
  RETURN NEW;
END;
$function$;