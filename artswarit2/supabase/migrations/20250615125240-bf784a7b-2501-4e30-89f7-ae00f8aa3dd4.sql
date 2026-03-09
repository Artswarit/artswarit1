
-- Create a table for clients to save artists
CREATE TABLE public.saved_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_saved_artist UNIQUE (client_id, artist_id)
);
COMMENT ON TABLE public.saved_artists IS 'Stores records of clients saving artists for future reference.';
COMMENT ON COLUMN public.saved_artists.client_id IS 'The ID of the client who saved the artist.';
COMMENT ON COLUMN public.saved_artists.artist_id IS 'The ID of the artist who was saved.';

-- Add Row Level Security (RLS) to saved_artists
ALTER TABLE public.saved_artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view their own saved artists" ON public.saved_artists FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can save artists" ON public.saved_artists FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can unsave their own saved artists" ON public.saved_artists FOR DELETE USING (auth.uid() = client_id);

-- Create indexes for performance on saved_artists
CREATE INDEX idx_saved_artists_client_id ON public.saved_artists(client_id);
CREATE INDEX idx_saved_artists_artist_id ON public.saved_artists(artist_id);


-- Add Row Level Security (RLS) to projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can create projects for themselves.
CREATE POLICY "Authenticated users can create projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Policy: Clients can view their own projects.
CREATE POLICY "Clients can view their own projects"
  ON public.projects
  FOR SELECT
  USING (auth.uid() = client_id);

-- Policy: Artists can view projects they are assigned to.
CREATE POLICY "Artists can view their assigned projects"
  ON public.projects
  FOR SELECT
  USING (auth.uid() = artist_id);

-- Policy: Clients and artists can update their projects.
CREATE POLICY "Users can update their own projects"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = artist_id);

