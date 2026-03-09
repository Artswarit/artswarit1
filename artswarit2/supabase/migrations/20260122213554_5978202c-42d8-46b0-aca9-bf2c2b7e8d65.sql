-- First delete the existing self-review(s)
DELETE FROM public.project_reviews WHERE client_id = artist_id;

-- Now add the CHECK constraint to prevent artists from reviewing themselves
ALTER TABLE public.project_reviews
ADD CONSTRAINT prevent_self_review CHECK (client_id != artist_id);

-- Also add the same constraint to client_reviews table to prevent clients from reviewing themselves
ALTER TABLE public.client_reviews
ADD CONSTRAINT prevent_self_client_review CHECK (client_id != artist_id);