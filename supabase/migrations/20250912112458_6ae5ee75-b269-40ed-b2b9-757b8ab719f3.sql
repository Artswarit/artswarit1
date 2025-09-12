-- Fix security issue: Email addresses exposed to public
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a more secure policy that only shows public profile data (excluding email)
-- Note: RLS doesn't support column-level restrictions, so we need to be more restrictive
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Create a view for public profile data (without sensitive info like email)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id,
    full_name,
    avatar_url,
    role,
    bio,
    location,
    website,
    social_links,
    is_verified,
    created_at,
    tags,
    portfolio_url,
    experience_years,
    hourly_rate,
    account_status
FROM public.profiles
WHERE account_status = 'approved';

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Grant access to the public view
GRANT SELECT ON public.public_profiles TO authenticated, anon;