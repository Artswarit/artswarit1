
-- 1. Create the "follows" table. Each row = client follows artist.
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- follower
  artist_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- followed
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (client_id, artist_id)
);

-- 2. Enable RLS for security
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- 3. Allow clients to insert (follow) themselves only
CREATE POLICY "Clients can follow artists" ON public.follows
  FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- 4. Allow clients to view who they follow or artists who follow them
CREATE POLICY "Clients can view their follow relationships" ON public.follows
  FOR SELECT
  USING (client_id = auth.uid() OR artist_id = auth.uid());

-- 5. Allow clients to unfollow (delete) their own follows
CREATE POLICY "Clients can unfollow" ON public.follows
  FOR DELETE
  USING (client_id = auth.uid());

-- 6. Allow updating timestamps (optional, not needed normally)
CREATE POLICY "Clients can update their follows" ON public.follows
  FOR UPDATE
  USING (client_id = auth.uid());
