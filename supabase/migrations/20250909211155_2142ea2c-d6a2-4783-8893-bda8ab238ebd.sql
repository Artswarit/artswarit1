-- Create essential database functions and triggers

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update likes count
CREATE OR REPLACE FUNCTION public.update_artwork_likes_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for likes count
DROP TRIGGER IF EXISTS artwork_likes_count_insert ON public.artwork_likes;
DROP TRIGGER IF EXISTS artwork_likes_count_delete ON public.artwork_likes;
CREATE TRIGGER artwork_likes_count_insert
  AFTER INSERT ON public.artwork_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_artwork_likes_count();
CREATE TRIGGER artwork_likes_count_delete
  AFTER DELETE ON public.artwork_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_artwork_likes_count();

-- Function to increment artwork views
CREATE OR REPLACE FUNCTION public.increment_artwork_views(artwork_uuid UUID, user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  new_view_count INTEGER;
BEGIN
  -- Insert view record if not exists for this user/artwork combo in last hour
  INSERT INTO public.artwork_views (user_id, artwork_id)
  VALUES (user_uuid, artwork_uuid)
  ON CONFLICT DO NOTHING;
  
  -- Update views count on artwork if this is a new view
  UPDATE public.artworks 
  SET views_count = views_count + 1 
  WHERE id = artwork_uuid 
  AND NOT EXISTS (
    SELECT 1 FROM public.artwork_views 
    WHERE user_id = user_uuid AND artwork_id = artwork_uuid
    AND created_at > now() - interval '1 hour'
  );
  
  -- Return current view count
  SELECT views_count INTO new_view_count FROM public.artworks WHERE id = artwork_uuid;
  RETURN new_view_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get artist dashboard stats
CREATE OR REPLACE FUNCTION public.get_artist_dashboard_stats(artist_uuid UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
  current_month_start DATE;
BEGIN
  current_month_start := date_trunc('month', CURRENT_DATE);
  
  SELECT json_build_object(
    'total_artworks', COALESCE((SELECT COUNT(*) FROM public.artworks WHERE artist_id = artist_uuid), 0),
    'total_views', COALESCE((SELECT SUM(views_count) FROM public.artworks WHERE artist_id = artist_uuid), 0),
    'monthly_earnings', COALESCE((
      SELECT SUM(artist_earnings) FROM public.sales 
      WHERE artist_id = artist_uuid 
      AND created_at >= current_month_start
    ), 0),
    'total_followers', COALESCE((SELECT COUNT(*) FROM public.follows WHERE artist_id = artist_uuid), 0),
    'total_sales', COALESCE((SELECT COUNT(*) FROM public.sales WHERE artist_id = artist_uuid), 0),
    'total_earnings', COALESCE((SELECT SUM(artist_earnings) FROM public.sales WHERE artist_id = artist_uuid), 0),
    'pending_projects', COALESCE((SELECT COUNT(*) FROM public.projects WHERE artist_id = artist_uuid AND status = 'pending'), 0)
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record artwork sale
CREATE OR REPLACE FUNCTION public.record_artwork_sale(
  artwork_uuid UUID, 
  buyer_uuid UUID, 
  sale_amount DECIMAL
)
RETURNS UUID AS $$
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
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    artwork_artist_id,
    'New Sale!',
    'Your artwork has been sold for $' || sale_amount,
    'success'
  );
  
  -- Create notification for buyer
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    buyer_uuid,
    'Purchase Complete!',
    'You have successfully purchased the artwork for $' || sale_amount,
    'success'
  );
  
  RETURN sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  );
END;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_artworks_updated_at ON public.artworks;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS update_artwork_feedback_updated_at ON public.artwork_feedback;
DROP TRIGGER IF EXISTS update_withdrawals_updated_at ON public.withdrawals;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at
  BEFORE UPDATE ON public.artworks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artwork_feedback_updated_at
  BEFORE UPDATE ON public.artwork_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON public.withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER TABLE public.artworks REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.sales REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;