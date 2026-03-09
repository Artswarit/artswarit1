-- Add search_path protection to SECURITY DEFINER functions that are missing it

CREATE OR REPLACE FUNCTION public.update_artwork_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_artwork_id uuid;
  delta integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    target_artwork_id := NEW.artwork_id;
    delta := 1;
  ELSIF TG_OP = 'DELETE' THEN
    target_artwork_id := OLD.artwork_id;
    delta := -1;
  ELSE
    RETURN NULL;
  END IF;

  UPDATE public.artworks
  SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{likes_count}',
    to_jsonb(
      GREATEST(
        COALESCE((metadata->>'likes_count')::int, 0) + delta,
        0
      )
    ),
    true
  )
  WHERE id = target_artwork_id;

  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  ELSE
    RETURN OLD;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_artwork_views_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_artwork_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    target_artwork_id := NEW.artwork_id;
    
    UPDATE public.artworks
    SET metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{views_count}',
      to_jsonb(
        COALESCE((metadata->>'views_count')::int, 0) + 1
      ),
      true
    )
    WHERE id = target_artwork_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    target_artwork_id := OLD.artwork_id;
    
    UPDATE public.artworks
    SET metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{views_count}',
      to_jsonb(
        GREATEST(COALESCE((metadata->>'views_count')::int, 0) - 1, 0)
      ),
      true
    )
    WHERE id = target_artwork_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_artwork_views(artwork_uuid uuid, user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.get_artist_stats(artist_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.auto_upgrade_premium()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active AND NEW.subscription_tier IS NOT NULL THEN
    UPDATE public.profiles SET role = 'premium' WHERE id = NEW.user_id;
  ELSIF NOT NEW.is_active THEN
    -- Downgrade to regular user if subscription becomes inactive
    UPDATE public.profiles SET role = 'artist' WHERE id = NEW.user_id AND role = 'premium';
  END IF;
  RETURN NEW;
END;
$$;