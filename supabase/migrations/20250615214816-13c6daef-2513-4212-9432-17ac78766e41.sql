
-- Create a table for artwork comments and reviews
CREATE TABLE public.artwork_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0),
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  parent_id UUID REFERENCES public.artwork_feedback(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add an index for faster lookups
CREATE INDEX ON public.artwork_feedback (artwork_id);

-- Add Row Level Security (RLS)
ALTER TABLE public.artwork_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view feedback
CREATE POLICY "Public can view feedback"
ON public.artwork_feedback
FOR SELECT
USING (true);

-- Policy: Authenticated users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
ON public.artwork_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own feedback
CREATE POLICY "Users can update their own feedback"
ON public.artwork_feedback
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own feedback
CREATE POLICY "Users can delete their own feedback"
ON public.artwork_feedback
FOR DELETE
USING (auth.uid() = user_id);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_artwork_feedback_updated_at
BEFORE UPDATE ON public.artwork_feedback
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
