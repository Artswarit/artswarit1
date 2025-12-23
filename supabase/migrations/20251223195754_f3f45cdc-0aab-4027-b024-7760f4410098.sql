-- Create a trigger function to notify artist when their artwork is liked
CREATE OR REPLACE FUNCTION public.notify_artwork_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  artwork_record RECORD;
  liker_name TEXT;
BEGIN
  -- Get the artwork and artist info
  SELECT id, artist_id, title INTO artwork_record
  FROM public.artworks
  WHERE id = NEW.artwork_id;

  -- Don't notify if liking own artwork
  IF artwork_record.artist_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get the liker's name
  SELECT COALESCE(name, email) INTO liker_name
  FROM public.users
  WHERE id = NEW.user_id;

  -- Insert notification for the artist
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (
    artwork_record.artist_id,
    'like',
    'New Like!',
    COALESCE(liker_name, 'Someone') || ' liked your artwork "' || artwork_record.title || '"',
    jsonb_build_object(
      'artwork_id', NEW.artwork_id,
      'liker_id', NEW.user_id,
      'like_id', NEW.id
    )
  );

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_artwork_like ON public.artwork_likes;
CREATE TRIGGER on_artwork_like
  AFTER INSERT ON public.artwork_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_artwork_like();

-- Allow system to insert notifications (update RLS)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);