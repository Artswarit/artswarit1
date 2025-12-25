-- Fix: Remove the overly permissive public SELECT policy on users table
-- The public_users view should be used for public access instead

-- Drop the permissive policy that exposes emails
DROP POLICY IF EXISTS "Public can view non-sensitive user info" ON public.users;

-- Users can still view their own complete profile (existing policy)
-- and the public_users view (without email) remains available for public access