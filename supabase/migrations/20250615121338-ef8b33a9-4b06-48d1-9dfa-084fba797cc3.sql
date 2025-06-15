
-- Update the existing subscribers table to match the new requirements
ALTER TABLE public.subscribers 
DROP CONSTRAINT IF EXISTS subscribers_subscription_tier_check;

-- Update the subscription_tier enum to include the new tiers
DROP TYPE IF EXISTS public.subscription_tier CASCADE;
CREATE TYPE public.subscription_tier AS ENUM ('monthly', 'yearly', 'lifetime');

-- Recreate the subscribers table with proper structure
DROP TABLE IF EXISTS public.subscribers CASCADE;
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscription_tier public.subscription_tier,
  is_active BOOLEAN NOT NULL DEFAULT false,
  renew_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  upgraded_role TEXT DEFAULT 'premium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, subscription_tier)
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Policies for subscribers table
CREATE POLICY "Users can view own subscription" ON public.subscribers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscription" ON public.subscribers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Backend can insert subscriptions" ON public.subscribers
  FOR INSERT WITH CHECK (true);

-- Create index for quick lookup
CREATE INDEX idx_subscribers_user_id ON public.subscribers (user_id);

-- Function to auto-upgrade user role on subscription activation
CREATE OR REPLACE FUNCTION public.auto_upgrade_premium() RETURNS trigger AS $$
BEGIN
  IF NEW.is_active AND NEW.subscription_tier IS NOT NULL THEN
    UPDATE public.profiles SET role = 'premium' WHERE id = NEW.user_id;
  ELSIF NOT NEW.is_active THEN
    -- Downgrade to regular user if subscription becomes inactive
    UPDATE public.profiles SET role = 'artist' WHERE id = NEW.user_id AND role = 'premium';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update user role based on subscription status
DROP TRIGGER IF EXISTS update_role_on_sub ON public.subscribers;
CREATE TRIGGER update_role_on_sub
  AFTER INSERT OR UPDATE OF is_active, subscription_tier ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.auto_upgrade_premium();
