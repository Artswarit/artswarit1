
-- Add account_status column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending' CHECK (account_status IN ('pending', 'approved', 'rejected'));

-- Update existing profiles to have 'approved' status by default for existing users
UPDATE public.profiles 
SET account_status = 'approved' 
WHERE account_status IS NULL;
