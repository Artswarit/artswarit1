-- Fix broken likes counter trigger function (artworks table has no likes_count column; counts are stored in metadata jsonb)
CREATE OR REPLACE FUNCTION public.update_artwork_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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