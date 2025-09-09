-- Create comprehensive database schema for Artswarit platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('client', 'artist', 'admin', 'premium');
CREATE TYPE account_status AS ENUM ('pending', 'approved', 'suspended', 'banned');
CREATE TYPE project_status AS ENUM ('pending', 'active', 'completed', 'cancelled', 'disputed');
CREATE TYPE transaction_type AS ENUM ('artwork_purchase', 'commission', 'subscription', 'tip', 'withdrawal');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'message', 'payment');
CREATE TYPE subscription_tier AS ENUM ('basic', 'premium', 'enterprise');

-- Create profiles table (enhanced)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'client',
  bio TEXT,
  location TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  account_status account_status DEFAULT 'pending',
  tags TEXT[],
  portfolio_url TEXT,
  experience_years INTEGER,
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create artworks table (enhanced)
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  price DECIMAL(10,2),
  is_for_sale BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  approval_status TEXT DEFAULT 'pending',
  release_date TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects/commissions table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2),
  deadline DATE,
  status project_status DEFAULT 'pending',
  requirements JSONB DEFAULT '{}',
  deliverables JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  project_title TEXT,
  status TEXT DEFAULT 'active',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'completed',
  stripe_payment_intent_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'completed',
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  platform_fee DECIMAL(10,2) GENERATED ALWAYS AS (amount * commission_rate / 100) STORED,
  artist_earnings DECIMAL(10,2) GENERATED ALWAYS AS (amount - (amount * commission_rate / 100)) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active',
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, artist_id)
);

-- Create artwork_likes table
CREATE TABLE IF NOT EXISTS public.artwork_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artwork_id, user_id)
);

-- Create artwork_views table
CREATE TABLE IF NOT EXISTS public.artwork_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create artwork_feedback table
CREATE TABLE IF NOT EXISTS public.artwork_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  parent_id UUID REFERENCES public.artwork_feedback(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved_artists table
CREATE TABLE IF NOT EXISTS public.saved_artists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, artist_id)
);

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_transfer_id TEXT,
  bank_details JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table for admin system
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create analytics tables
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('artworks', 'artworks', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false) ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;