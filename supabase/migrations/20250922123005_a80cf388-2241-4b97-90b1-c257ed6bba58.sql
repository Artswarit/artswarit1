-- Create ENUM Types (if they don't exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('artist', 'client', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE artwork_status AS ENUM ('public', 'private', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'success', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_type_enum AS ENUM ('image', 'video', 'audio', '3d_model');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create function to update 'updated_at' column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new users table with proper structure
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email varchar(255) UNIQUE NOT NULL,
  name varchar(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  bio text,
  profile_pic_url text,
  cover_photo_url text,
  social_links jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Recreate artworks table with new structure
DROP TABLE IF EXISTS public.artworks CASCADE;
CREATE TABLE public.artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  description text,
  category varchar(100) NOT NULL,
  tags text[],
  media_type media_type_enum NOT NULL DEFAULT 'image',
  media_url text NOT NULL,
  metadata jsonb DEFAULT '{}',
  price numeric(10, 2) CHECK (price >= 0 OR price IS NULL),
  status artwork_status NOT NULL DEFAULT 'public',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Update transactions table structure
DROP TABLE IF EXISTS public.transactions CASCADE;
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  stripe_payment_intent_id varchar(255),
  status transaction_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Update follows table structure
DROP TABLE IF EXISTS public.follows CASCADE;
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create likes table (rename from artwork_likes)
DROP TABLE IF EXISTS public.likes CASCADE;
CREATE TABLE public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  artwork_id uuid NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, artwork_id)
);

-- Create comments table (based on artwork_feedback structure)
DROP TABLE IF EXISTS public.comments CASCADE;
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Update notifications table if needed
DROP TABLE IF EXISTS public.notifications CASCADE;
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type varchar(50) NOT NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create reports table
DROP TABLE IF EXISTS public.reports CASCADE;
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  artwork_id uuid REFERENCES public.artworks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  reason varchar(100) NOT NULL,
  description text,
  status varchar(20) NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (artwork_id IS NOT NULL OR user_id IS NOT NULL)
);

-- Create indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_artworks_artist_id ON public.artworks(artist_id);
CREATE INDEX idx_artworks_status ON public.artworks(status);
CREATE INDEX idx_artworks_category ON public.artworks(category);
CREATE INDEX idx_artworks_tags_gin ON public.artworks USING GIN (tags);
CREATE INDEX idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON public.transactions(seller_id);
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_artwork_id ON public.likes(artwork_id);
CREATE INDEX idx_comments_artwork_id ON public.comments(artwork_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Create update triggers
CREATE TRIGGER on_users_update BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_artworks_update BEFORE UPDATE ON public.artworks FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_transactions_update BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_comments_update BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Allow public read access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow user to update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for artworks table
CREATE POLICY "Allow public read on public artworks" ON public.artworks FOR SELECT USING (status = 'public');
CREATE POLICY "Allow artist to read own artworks" ON public.artworks FOR SELECT USING (auth.uid() = artist_id);
CREATE POLICY "Allow artists to insert artworks" ON public.artworks FOR INSERT WITH CHECK (auth.uid() = artist_id AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'artist');
CREATE POLICY "Allow artist to update own artwork" ON public.artworks FOR UPDATE USING (auth.uid() = artist_id);
CREATE POLICY "Allow artist to delete own artwork" ON public.artworks FOR DELETE USING (auth.uid() = artist_id);

-- RLS Policies for transactions table
CREATE POLICY "Allow users to view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Allow buyers to create transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- RLS Policies for follows table
CREATE POLICY "Allow public read of follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Allow users to follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Allow users to unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for likes table
CREATE POLICY "Allow public read of likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Allow users to like artworks" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to unlike artworks" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comments table
CREATE POLICY "Allow public read of comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow users to comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notifications table
CREATE POLICY "Allow users to read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for reports table
CREATE POLICY "Allow users to create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Allow users to view own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to handle social notifications
CREATE OR REPLACE FUNCTION public.handle_social_notification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for social notifications
CREATE TRIGGER on_new_follow AFTER INSERT ON public.follows FOR EACH ROW EXECUTE PROCEDURE public.handle_social_notification();
CREATE TRIGGER on_new_like AFTER INSERT ON public.likes FOR EACH ROW EXECUTE PROCEDURE public.handle_social_notification();
CREATE TRIGGER on_new_comment AFTER INSERT ON public.comments FOR EACH ROW EXECUTE PROCEDURE public.handle_social_notification();

-- Ensure media bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Create storage policies for media bucket
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Allow authenticated users to upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "Allow users to update own files" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND (storage.foldername(name))[2] = auth.uid()::text);
CREATE POLICY "Allow users to delete own files" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND (storage.foldername(name))[2] = auth.uid()::text);