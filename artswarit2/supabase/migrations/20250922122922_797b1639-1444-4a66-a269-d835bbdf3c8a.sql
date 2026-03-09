-- Create missing ENUM Types
CREATE TYPE user_role AS ENUM ('artist', 'client', 'admin');
CREATE TYPE artwork_status AS ENUM ('public', 'private', 'archived');
CREATE TYPE transaction_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE media_type_enum AS ENUM ('image', 'video', 'audio', '3d_model');

-- Create function to update 'updated_at' column (overwrite if exists)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update existing tables to match specification structure

-- Drop and recreate users table with proper structure
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

-- Update artworks table structure
ALTER TABLE public.artworks 
  DROP COLUMN IF EXISTS approval_status,
  DROP COLUMN IF EXISTS views_count,
  DROP COLUMN IF EXISTS likes_count,
  DROP COLUMN IF EXISTS is_for_sale,
  DROP COLUMN IF EXISTS is_featured,
  DROP COLUMN IF EXISTS is_pinned,
  DROP COLUMN IF EXISTS release_date;

ALTER TABLE public.artworks 
  ADD COLUMN IF NOT EXISTS media_type media_type_enum DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS media_url text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status artwork_status DEFAULT 'public';

-- Make media_url NOT NULL after adding it
UPDATE public.artworks SET media_url = COALESCE(image_url, '') WHERE media_url IS NULL;
ALTER TABLE public.artworks ALTER COLUMN media_url SET NOT NULL;

-- Drop old image_url column if it exists
ALTER TABLE public.artworks DROP COLUMN IF EXISTS image_url;

-- Update transactions table structure
ALTER TABLE public.transactions 
  DROP COLUMN IF EXISTS from_user_id,
  DROP COLUMN IF EXISTS to_user_id,
  DROP COLUMN IF EXISTS currency,
  DROP COLUMN IF EXISTS type,
  DROP COLUMN IF EXISTS message,
  DROP COLUMN IF EXISTS metadata;

ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS artwork_id uuid REFERENCES public.artworks(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS buyer_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id varchar(255);

-- Update transactions status column type
ALTER TABLE public.transactions ALTER COLUMN status TYPE transaction_status USING status::transaction_status;

-- Create likes table (rename from artwork_likes if needed)
DROP TABLE IF EXISTS public.likes CASCADE;
CREATE TABLE public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  artwork_id uuid NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, artwork_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
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

-- Update follows table structure
ALTER TABLE public.follows 
  DROP COLUMN IF EXISTS client_id,
  DROP COLUMN IF EXISTS artist_id;

ALTER TABLE public.follows 
  ADD COLUMN IF NOT EXISTS follower_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS following_id uuid REFERENCES public.users(id) ON DELETE CASCADE;

-- Add unique constraint and check
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_id_following_id_key;
ALTER TABLE public.follows ADD CONSTRAINT follows_follower_id_following_id_key UNIQUE(follower_id, following_id);
ALTER TABLE public.follows ADD CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id);

-- Create necessary indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON public.artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON public.artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON public.artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_tags_gin ON public.artworks USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_artwork_id ON public.likes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_comments_artwork_id ON public.comments(artwork_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Create update triggers
DROP TRIGGER IF EXISTS on_users_update ON public.users;
CREATE TRIGGER on_users_update BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_artworks_update ON public.artworks;
CREATE TRIGGER on_artworks_update BEFORE UPDATE ON public.artworks FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_transactions_update ON public.transactions;
CREATE TRIGGER on_transactions_update BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_comments_update ON public.comments;
CREATE TRIGGER on_comments_update BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();