-- Create sales table for tracking artwork sales
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL,
  buyer_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sales table
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- RLS policies for sales
CREATE POLICY "Artists can view their own sales" 
ON public.sales 
FOR SELECT 
USING (auth.uid() = artist_id);

CREATE POLICY "Artists can insert their own sales" 
ON public.sales 
FOR INSERT 
WITH CHECK (auth.uid() = artist_id);

-- Add trigger for updated_at
CREATE TRIGGER update_sales_updated_at
BEFORE UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get artist dashboard stats
CREATE OR REPLACE FUNCTION public.get_artist_dashboard_stats(artist_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to record artwork sale
CREATE OR REPLACE FUNCTION public.record_artwork_sale(
  artwork_uuid uuid,
  buyer_uuid uuid,
  sale_amount decimal
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
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
$function$