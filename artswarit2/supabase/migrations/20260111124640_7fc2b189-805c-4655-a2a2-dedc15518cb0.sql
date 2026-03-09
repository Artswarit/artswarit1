-- Add client settings columns to profiles table for privacy, notifications, and preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS show_activity_stats BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_last_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS profile_visibility BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS in_app_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS project_update_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS message_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create login_sessions table for session management and login history
CREATE TABLE IF NOT EXISTS public.login_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info TEXT,
  ip_address TEXT,
  browser TEXT,
  os TEXT,
  location TEXT,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on login_sessions
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for login_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.login_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
ON public.login_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert sessions" 
ON public.login_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update sessions" 
ON public.login_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update last_active_at on profiles
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET last_active_at = now()
  WHERE id = NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to update last_active when messages are sent
DROP TRIGGER IF EXISTS update_last_active_on_message ON public.messages;
CREATE TRIGGER update_last_active_on_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_last_active();

-- Add last_active_at to public_profiles view (recreate view)
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  cover_url,
  bio,
  location,
  role,
  is_verified,
  created_at,
  website,
  portfolio_url,
  tags,
  account_status,
  experience_years,
  hourly_rate,
  social_links,
  last_active_at,
  show_activity_stats,
  show_last_active,
  profile_visibility
FROM public.profiles;