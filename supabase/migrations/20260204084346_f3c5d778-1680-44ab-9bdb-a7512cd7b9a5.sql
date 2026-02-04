-- Create artwork_unlocks table to track purchased artworks
CREATE TABLE public.artwork_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  payment_id TEXT,
  order_id TEXT,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate unlocks
CREATE UNIQUE INDEX idx_artwork_unlocks_unique ON public.artwork_unlocks(artwork_id, user_id);

-- Enable Row Level Security
ALTER TABLE public.artwork_unlocks ENABLE ROW LEVEL SECURITY;

-- Users can view their own unlocks
CREATE POLICY "Users can view their own artwork unlocks" 
ON public.artwork_unlocks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Only backend (service role) can insert unlocks
CREATE POLICY "Service role can insert unlocks" 
ON public.artwork_unlocks 
FOR INSERT 
WITH CHECK (true);

-- Artists can view who unlocked their artworks
CREATE POLICY "Artists can view unlocks of their artworks" 
ON public.artwork_unlocks 
FOR SELECT 
USING (
  artwork_id IN (
    SELECT id FROM public.artworks WHERE artist_id = auth.uid()
  )
);