-- Add cover_url column to profiles table for banner images
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cover_url text;

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;