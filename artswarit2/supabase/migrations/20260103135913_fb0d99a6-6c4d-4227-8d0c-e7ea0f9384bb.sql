-- Enable REPLICA IDENTITY FULL for follows table for real-time updates
ALTER TABLE public.follows REPLICA IDENTITY FULL;