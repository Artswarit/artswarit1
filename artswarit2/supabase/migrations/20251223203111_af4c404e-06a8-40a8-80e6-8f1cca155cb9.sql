-- Enable realtime for artwork_likes table
ALTER TABLE public.artwork_likes REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.artwork_likes;