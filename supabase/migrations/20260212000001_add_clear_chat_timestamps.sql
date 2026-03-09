-- Add columns to conversations table to track when each user cleared the chat
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS client_last_cleared_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS artist_last_cleared_at TIMESTAMP WITH TIME ZONE;
