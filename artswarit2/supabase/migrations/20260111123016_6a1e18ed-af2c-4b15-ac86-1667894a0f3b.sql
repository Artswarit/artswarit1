-- Create table for artists to review clients (reverse of project_reviews)
CREATE TABLE public.client_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, artist_id) -- One review per project per artist
);

-- Enable Row Level Security
ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_reviews
CREATE POLICY "Artists can view all client reviews"
  ON public.client_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Artists can create reviews for their completed projects"
  ON public.client_reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = artist_id AND
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id
      AND artist_id = auth.uid()
      AND status = 'completed'
    )
  );

CREATE POLICY "Artists can update their own reviews"
  ON public.client_reviews
  FOR UPDATE
  USING (auth.uid() = artist_id);

CREATE POLICY "Artists can delete their own reviews"
  ON public.client_reviews
  FOR DELETE
  USING (auth.uid() = artist_id);

-- Create trigger for updated_at
CREATE TRIGGER update_client_reviews_updated_at
  BEFORE UPDATE ON public.client_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for client_reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_reviews;