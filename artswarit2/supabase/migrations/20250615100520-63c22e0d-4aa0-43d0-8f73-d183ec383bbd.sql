
-- 1. Enum for subscription tiers
CREATE TYPE public.subscription_tier AS ENUM ('monthly', 'yearly', 'lifetime');

-- 2. Subscribers table to store Stripe/Razorpay subs
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscription_tier public.subscription_tier,
  is_active BOOLEAN NOT NULL DEFAULT false,
  renew_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  upgraded_role TEXT, -- e.g. 'premium'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, subscription_tier)
);

-- 3. Policy: Only users can view/update their own subscription
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscribers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscription" ON public.subscribers
  FOR UPDATE USING (user_id = auth.uid());

-- Inserts allowed from backend function:
CREATE POLICY "Backend can insert subscriptions" ON public.subscribers
  FOR INSERT WITH CHECK (true);

-- 4. Add index for quick lookup
CREATE INDEX idx_subscribers_user_id ON public.subscribers (user_id);

-- 5. Optional: trigger to set user role=’premium’ on sub activation
CREATE OR REPLACE FUNCTION public.auto_upgrade_premium() RETURNS trigger AS $$
BEGIN
  IF NEW.is_active AND NEW.subscription_tier IS NOT NULL THEN
    UPDATE public.profiles SET role = 'premium' WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_role_on_sub ON public.subscribers;
CREATE TRIGGER update_role_on_sub
AFTER INSERT OR UPDATE OF is_active, subscription_tier ON public.subscribers
FOR EACH ROW EXECUTE FUNCTION public.auto_upgrade_premium();

