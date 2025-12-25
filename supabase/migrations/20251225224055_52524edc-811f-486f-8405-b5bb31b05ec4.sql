-- Create artist_services table
CREATE TABLE public.artist_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starting_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artist_services ENABLE ROW LEVEL SECURITY;

-- Public can view all services
CREATE POLICY "Anyone can view services"
ON public.artist_services
FOR SELECT
USING (true);

-- Artists can insert their own services
CREATE POLICY "Artists can insert their own services"
ON public.artist_services
FOR INSERT
WITH CHECK (auth.uid() = artist_id);

-- Artists can update their own services
CREATE POLICY "Artists can update their own services"
ON public.artist_services
FOR UPDATE
USING (auth.uid() = artist_id);

-- Artists can delete their own services
CREATE POLICY "Artists can delete their own services"
ON public.artist_services
FOR DELETE
USING (auth.uid() = artist_id);

-- Trigger for updated_at
CREATE TRIGGER update_artist_services_updated_at
BEFORE UPDATE ON public.artist_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();