-- Fix RLS policies for artworks table to allow artists to insert their own artworks
-- The current policy is checking for 'artist' role in users table but we need to check profiles table

-- Drop existing policies for artworks
DROP POLICY IF EXISTS "Allow artists to insert artworks" ON public.artworks;
DROP POLICY IF EXISTS "Allow artist to read own artworks" ON public.artworks;
DROP POLICY IF EXISTS "Allow artist to update own artwork" ON public.artworks;
DROP POLICY IF EXISTS "Allow artist to delete own artwork" ON public.artworks;
DROP POLICY IF EXISTS "Allow public read on public artworks" ON public.artworks;

-- Create new policies that work with the profiles table
CREATE POLICY "Allow artists to insert artworks" 
ON public.artworks 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = artist_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'artist'
  )
);

CREATE POLICY "Allow artist to read own artworks" 
ON public.artworks 
FOR SELECT 
TO authenticated
USING (auth.uid() = artist_id);

CREATE POLICY "Allow artist to update own artwork" 
ON public.artworks 
FOR UPDATE 
TO authenticated
USING (auth.uid() = artist_id);

CREATE POLICY "Allow artist to delete own artwork" 
ON public.artworks 
FOR DELETE 
TO authenticated
USING (auth.uid() = artist_id);

CREATE POLICY "Allow public read on public artworks" 
ON public.artworks 
FOR SELECT 
TO authenticated, anon
USING (status = 'public'::artwork_status);

-- Fix user_roles table to have proper RLS policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);