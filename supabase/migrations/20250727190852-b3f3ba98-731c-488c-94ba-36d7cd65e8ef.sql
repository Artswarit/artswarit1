-- Create function to get artist dashboard stats
CREATE OR REPLACE FUNCTION public.get_artist_dashboard_stats(artist_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  stats JSON;
  current_month_start DATE;
BEGIN
  current_month_start := date_trunc('month', CURRENT_DATE);
  
  SELECT json_build_object(
    'total_artworks', COALESCE((SELECT COUNT(*) FROM public.artworks WHERE artist_id = artist_uuid), 0),
    'total_views', COALESCE((SELECT SUM(views_count) FROM public.artworks WHERE artist_id = artist_uuid), 0),
    'monthly_earnings', COALESCE((
      SELECT SUM(amount) FROM public.sales 
      WHERE artist_id = artist_uuid 
      AND created_at >= current_month_start
    ), 0),
    'total_followers', COALESCE((SELECT COUNT(*) FROM public.follows WHERE artist_id = artist_uuid), 0),
    'total_sales', COALESCE((SELECT COUNT(*) FROM public.sales WHERE artist_id = artist_uuid), 0),
    'total_earnings', COALESCE((SELECT SUM(amount) FROM public.sales WHERE artist_id = artist_uuid), 0)
  ) INTO stats;
  
  RETURN stats;
END;
$function$