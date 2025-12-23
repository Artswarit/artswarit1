-- Create trigger function to update views_count in metadata
CREATE OR REPLACE FUNCTION public.update_artwork_views_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Create trigger on artwork_views table
CREATE TRIGGER artwork_views_count_trigger
AFTER INSERT OR DELETE ON public.artwork_views
FOR EACH ROW
EXECUTE FUNCTION update_artwork_views_count();

-- Sync existing view counts from artwork_views table
UPDATE public.artworks a
SET metadata = jsonb_set(
  COALESCE(a.metadata, '{}'::jsonb),
  '{views_count}',
  to_jsonb(COALESCE(counts.view_count, 0)),
  true
)
FROM (
  SELECT artwork_id, COUNT(*)::int as view_count
  FROM public.artwork_views
  GROUP BY artwork_id
) counts
WHERE a.id = counts.artwork_id;

-- Set views_count to 0 for artworks with no views
UPDATE public.artworks
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{views_count}',
  '0'::jsonb,
  true
)
WHERE id NOT IN (SELECT DISTINCT artwork_id FROM public.artwork_views WHERE artwork_id IS NOT NULL);