-- Sync existing like counts in metadata from artwork_likes table
UPDATE public.artworks a
SET metadata = jsonb_set(
  COALESCE(a.metadata, '{}'::jsonb),
  '{likes_count}',
  to_jsonb(COALESCE(counts.like_count, 0)),
  true
)
FROM (
  SELECT artwork_id, COUNT(*)::int as like_count
  FROM public.artwork_likes
  GROUP BY artwork_id
) counts
WHERE a.id = counts.artwork_id;

-- Also set likes_count to 0 for artworks with no likes
UPDATE public.artworks
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{likes_count}',
  '0'::jsonb,
  true
)
WHERE id NOT IN (SELECT DISTINCT artwork_id FROM public.artwork_likes WHERE artwork_id IS NOT NULL);