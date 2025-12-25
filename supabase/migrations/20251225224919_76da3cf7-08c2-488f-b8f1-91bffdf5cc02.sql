-- Add artist response columns to project_reviews
ALTER TABLE public.project_reviews
ADD COLUMN artist_response TEXT,
ADD COLUMN artist_response_at TIMESTAMP WITH TIME ZONE;

-- Update policy to allow artists to update their response
DROP POLICY IF EXISTS "Artists can respond to reviews" ON public.project_reviews;
CREATE POLICY "Artists can respond to reviews"
ON public.project_reviews
FOR UPDATE
USING (auth.uid() = artist_id)
WITH CHECK (auth.uid() = artist_id);