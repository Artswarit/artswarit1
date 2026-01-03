-- Fix handle_social_notification trigger function to avoid referencing columns
-- that don't exist on certain tables (e.g., follows has follower_id, not user_id).

CREATE OR REPLACE FUNCTION public.handle_social_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  target_user_id UUID;
  actor_id UUID;
  actor_name TEXT;
BEGIN
  -- Determine actor and target based on the table that fired the trigger
  IF TG_TABLE_NAME = 'follows' THEN
    actor_id := (to_jsonb(NEW)->>'follower_id')::uuid;
    target_user_id := (to_jsonb(NEW)->>'following_id')::uuid;
    notification_title := 'New Follower';
  ELSIF TG_TABLE_NAME = 'likes' THEN
    actor_id := (to_jsonb(NEW)->>'user_id')::uuid;
    notification_title := 'New Like';
    SELECT artist_id INTO target_user_id
    FROM public.artworks
    WHERE id = (to_jsonb(NEW)->>'artwork_id')::uuid;
  ELSIF TG_TABLE_NAME = 'comments' THEN
    actor_id := (to_jsonb(NEW)->>'user_id')::uuid;
    notification_title := 'New Comment';
    SELECT artist_id INTO target_user_id
    FROM public.artworks
    WHERE id = (to_jsonb(NEW)->>'artwork_id')::uuid;
  ELSE
    RETURN NEW;
  END IF;

  -- If we can't determine actor or target, skip notification
  IF actor_id IS NULL OR target_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get actor name (fallback to generic)
  SELECT name INTO actor_name FROM public.users WHERE id = actor_id;
  actor_name := COALESCE(actor_name, 'Someone');

  IF TG_TABLE_NAME = 'follows' THEN
    notification_message := actor_name || ' started following you';
  ELSIF TG_TABLE_NAME = 'likes' THEN
    notification_message := actor_name || ' liked your artwork';
  ELSIF TG_TABLE_NAME = 'comments' THEN
    notification_message := actor_name || ' commented on your artwork';
  END IF;

  -- Don't notify self
  IF target_user_id <> actor_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      target_user_id,
      TG_TABLE_NAME,
      notification_title,
      notification_message,
      json_build_object('actor_id', actor_id)
    );
  END IF;

  RETURN NEW;
END;
$$;