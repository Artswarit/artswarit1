-- Create project_reviews table
CREATE TABLE public.project_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- Enable RLS
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews (public artist profiles)
CREATE POLICY "Anyone can view reviews"
ON public.project_reviews
FOR SELECT
USING (true);

-- Clients can insert reviews for their own completed projects
CREATE POLICY "Clients can insert their own reviews"
ON public.project_reviews
FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- Clients can update their own reviews
CREATE POLICY "Clients can update their own reviews"
ON public.project_reviews
FOR UPDATE
USING (auth.uid() = client_id);

-- Clients can delete their own reviews
CREATE POLICY "Clients can delete their own reviews"
ON public.project_reviews
FOR DELETE
USING (auth.uid() = client_id);

-- Trigger for updated_at
CREATE TRIGGER update_project_reviews_updated_at
BEFORE UPDATE ON public.project_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();