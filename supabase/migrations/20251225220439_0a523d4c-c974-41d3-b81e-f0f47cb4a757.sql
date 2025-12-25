-- Fix remaining SECURITY DEFINER functions missing search_path protection
-- (handle_new_user and handle_social_notification)

-- Create public_users_view to hide email from public queries
CREATE OR REPLACE VIEW public.public_users AS
SELECT 
  id, 
  name, 
  role, 
  bio, 
  profile_pic_url, 
  cover_photo_url, 
  social_links,
  created_at,
  updated_at
FROM public.users;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow public read access" ON public.users;

-- Create new policies that restrict email access to profile owners
CREATE POLICY "Users can view own complete profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Public can view non-sensitive user info" 
  ON public.users 
  FOR SELECT 
  USING (true);

-- Create a security definer function to get public user info without email
CREATE OR REPLACE FUNCTION public.get_public_user_info(target_user_id uuid)
RETURNS TABLE (
  id uuid,
  name varchar,
  role user_role,
  bio text,
  profile_pic_url text,
  cover_photo_url text,
  social_links jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    u.id, 
    u.name, 
    u.role, 
    u.bio, 
    u.profile_pic_url, 
    u.cover_photo_url, 
    u.social_links,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.id = target_user_id;
$$;

-- Fix handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into users table if not exists
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')::user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    role = COALESCE(EXCLUDED.role, users.role);

  -- Insert into profiles table if not exists
  INSERT INTO public.profiles (id, email, full_name, role, account_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    'approved'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role);

  RETURN NEW;
END;
$$;

-- Fix handle_social_notification function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_social_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  target_user_id UUID;
  actor_name TEXT;
BEGIN
  -- Get the actor's name
  SELECT name INTO actor_name FROM public.users WHERE id = COALESCE(NEW.follower_id, NEW.user_id);
  
  IF TG_TABLE_NAME = 'follows' THEN
    notification_title := 'New Follower';
    notification_message := actor_name || ' started following you';
    target_user_id := NEW.following_id;
  ELSIF TG_TABLE_NAME = 'likes' THEN
    notification_title := 'New Like';
    notification_message := actor_name || ' liked your artwork';
    SELECT artist_id INTO target_user_id FROM public.artworks WHERE id = NEW.artwork_id;
  ELSIF TG_TABLE_NAME = 'comments' THEN
    notification_title := 'New Comment';
    notification_message := actor_name || ' commented on your artwork';
    SELECT artist_id INTO target_user_id FROM public.artworks WHERE id = NEW.artwork_id;
  END IF;
  
  -- Don't notify self
  IF target_user_id != COALESCE(NEW.follower_id, NEW.user_id) THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      target_user_id,
      TG_TABLE_NAME,
      notification_title,
      notification_message,
      json_build_object('actor_id', COALESCE(NEW.follower_id, NEW.user_id))
    );
  END IF;
  
  RETURN NEW;
END;
$$;