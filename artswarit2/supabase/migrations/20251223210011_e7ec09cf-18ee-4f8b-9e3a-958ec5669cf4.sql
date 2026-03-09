-- Remove any existing duplicate likes (keep the first one)
DELETE FROM public.artwork_likes a
USING public.artwork_likes b
WHERE a.id > b.id
  AND a.artwork_id = b.artwork_id
  AND a.user_id = b.user_id;

-- Remove any existing duplicate views (keep the first one)
DELETE FROM public.artwork_views a
USING public.artwork_views b
WHERE a.id > b.id
  AND a.artwork_id = b.artwork_id
  AND a.user_id = b.user_id
  AND a.user_id IS NOT NULL;

-- Add unique constraint on artwork_likes to prevent duplicate likes
ALTER TABLE public.artwork_likes
ADD CONSTRAINT artwork_likes_user_artwork_unique UNIQUE (user_id, artwork_id);

-- Add unique constraint on artwork_views to prevent duplicate views per user
CREATE UNIQUE INDEX artwork_views_user_artwork_unique 
ON public.artwork_views (user_id, artwork_id) 
WHERE user_id IS NOT NULL;