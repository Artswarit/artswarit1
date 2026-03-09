-- Create payments table for tracking milestone payments
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID NOT NULL REFERENCES public.project_milestones(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  artist_id UUID NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  platform_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  artist_payout DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(milestone_id, status) -- Prevent duplicate successful payments
);

-- Create razorpay_accounts table for artist KYC/payout accounts
CREATE TABLE public.razorpay_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  razorpay_account_id VARCHAR(255),
  account_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  kyc_status VARCHAR(50) NOT NULL DEFAULT 'not_started',
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  bank_account_name VARCHAR(255),
  bank_account_number VARCHAR(255),
  bank_ifsc_code VARCHAR(50),
  bank_swift_code VARCHAR(50),
  bank_iban VARCHAR(100),
  phone VARCHAR(50),
  country VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook_logs table for debugging and idempotency
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.razorpay_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = artist_id);

CREATE POLICY "Clients can create payments for their projects" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- RLS policies for razorpay_accounts
CREATE POLICY "Users can view their own razorpay account" ON public.razorpay_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own razorpay account" ON public.razorpay_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own razorpay account" ON public.razorpay_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for webhook_logs (admin only, but we'll allow service role)
CREATE POLICY "No direct access to webhook logs" ON public.webhook_logs
  FOR SELECT USING (false);

-- Create indexes for performance
CREATE INDEX idx_payments_milestone_id ON public.payments(milestone_id);
CREATE INDEX idx_payments_project_id ON public.payments(project_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_razorpay_accounts_user_id ON public.razorpay_accounts(user_id);
CREATE INDEX idx_webhook_logs_event_id ON public.webhook_logs(event_id);

-- Trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_razorpay_accounts_updated_at
  BEFORE UPDATE ON public.razorpay_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for payments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.razorpay_accounts;