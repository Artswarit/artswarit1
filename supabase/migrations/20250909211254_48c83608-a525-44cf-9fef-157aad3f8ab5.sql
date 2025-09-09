-- Create database functions and triggers for business logic

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_artworks_updated_at ON public.artworks;
CREATE TRIGGER update_artworks_updated_at
  BEFORE UPDATE ON public.artworks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update artwork likes count
CREATE OR REPLACE FUNCTION public.update_artwork_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.artworks SET likes_count = likes_count + 1 WHERE id = NEW.artwork_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.artworks SET likes_count = likes_count - 1 WHERE id = OLD.artwork_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for likes count
DROP TRIGGER IF EXISTS artwork_likes_count_trigger ON public.artwork_likes;
CREATE TRIGGER artwork_likes_count_trigger
  AFTER INSERT OR DELETE ON public.artwork_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_artwork_likes_count();

-- Function to increment artwork views
CREATE OR REPLACE FUNCTION public.increment_artwork_views(artwork_uuid UUID, user_uuid UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_view_count INTEGER;
BEGIN
  -- Insert view record
  INSERT INTO public.artwork_views (user_id, artwork_id)
  VALUES (user_uuid, artwork_uuid)
  ON CONFLICT DO NOTHING;
  
  -- Update views count on artwork
  UPDATE public.artworks 
  SET views_count = views_count + 1 
  WHERE id = artwork_uuid;
  
  -- Return current view count
  SELECT views_count INTO new_view_count FROM public.artworks WHERE id = artwork_uuid;
  RETURN new_view_count;
END;
$$;

-- Function to get artist statistics
CREATE OR REPLACE FUNCTION public.get_artist_stats(artist_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_artworks', COALESCE((SELECT COUNT(*) FROM public.artworks WHERE artist_id = artist_uuid), 0),
    'approved_artworks', COALESCE((SELECT COUNT(*) FROM public.artworks WHERE artist_id = artist_uuid AND approval_status = 'approved'), 0),
    'total_views', COALESCE((SELECT SUM(views_count) FROM public.artworks WHERE artist_id = artist_uuid), 0),
    'total_likes', COALESCE((SELECT SUM(likes_count) FROM public.artworks WHERE artist_id = artist_uuid), 0),
    'total_followers', COALESCE((SELECT COUNT(*) FROM public.follows WHERE artist_id = artist_uuid), 0),
    'pending_projects', COALESCE((SELECT COUNT(*) FROM public.projects WHERE artist_id = artist_uuid AND status = 'pending'), 0),
    'total_earnings', COALESCE((SELECT SUM(artist_earnings) FROM public.sales WHERE artist_id = artist_uuid), 0),
    'monthly_earnings', COALESCE((
      SELECT SUM(artist_earnings) FROM public.sales 
      WHERE artist_id = artist_uuid 
      AND created_at >= date_trunc('month', CURRENT_DATE)
    ), 0)
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  recipient_id UUID,
  title TEXT,
  message TEXT,
  notification_type notification_type DEFAULT 'info',
  action_url TEXT DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, action_url, metadata)
  VALUES (recipient_id, title, message, notification_type, action_url, metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to record artwork sale
CREATE OR REPLACE FUNCTION public.record_artwork_sale(
  artwork_uuid UUID,
  buyer_uuid UUID,
  sale_amount DECIMAL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sale_id UUID;
  artwork_artist_id UUID;
BEGIN
  -- Get artist_id from artwork
  SELECT artist_id INTO artwork_artist_id FROM public.artworks WHERE id = artwork_uuid;
  
  -- Insert sale record
  INSERT INTO public.sales (artwork_id, artist_id, buyer_id, amount)
  VALUES (artwork_uuid, artwork_artist_id, buyer_uuid, sale_amount)
  RETURNING id INTO sale_id;
  
  -- Create notification for artist
  PERFORM public.create_notification(
    artwork_artist_id,
    'New Sale!',
    'Your artwork has been sold for $' || sale_amount,
    'success'
  );
  
  RETURN sale_id;
END;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- Function to get trending artworks
CREATE OR REPLACE FUNCTION public.get_trending_artworks(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
  id UUID,
  title TEXT,
  image_url TEXT,
  artist_id UUID,
  artist_name TEXT,
  views_count INTEGER,
  likes_count INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.image_url,
    a.artist_id,
    p.full_name as artist_name,
    a.views_count,
    a.likes_count,
    a.created_at
  FROM public.artworks a
  JOIN public.profiles p ON a.artist_id = p.id
  WHERE a.approval_status = 'approved'
    AND a.created_at >= NOW() - INTERVAL '%s days' % days_back
  ORDER BY (a.views_count + a.likes_count * 2) DESC
  LIMIT limit_count;
END;
$$;

-- Enable realtime for key tables
ALTER TABLE public.artworks REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.sales REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.artworks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;