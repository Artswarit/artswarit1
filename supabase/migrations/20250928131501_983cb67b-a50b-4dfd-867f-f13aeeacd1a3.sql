-- Fix Function Search Path Mutable warnings by adding SET search_path = public
-- This prevents SQL injection attacks via search_path manipulation

-- Update existing functions to include proper search_path
ALTER FUNCTION public.increment_artwork_views(uuid, uuid) SET search_path = public;

ALTER FUNCTION public.get_artist_stats(uuid) SET search_path = public;

ALTER FUNCTION public.record_artwork_sale(uuid, uuid, numeric) SET search_path = public;

ALTER FUNCTION public.handle_social_notification() SET search_path = public;

ALTER FUNCTION public.update_artwork_likes_count() SET search_path = public;

ALTER FUNCTION public.is_admin(uuid) SET search_path = public;

ALTER FUNCTION public.auto_upgrade_premium() SET search_path = public;