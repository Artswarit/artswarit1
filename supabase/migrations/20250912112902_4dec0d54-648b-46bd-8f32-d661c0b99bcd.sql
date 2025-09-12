-- Fix Function Search Path Mutable warnings by setting search_path on all SECURITY DEFINER functions
-- This addresses both the security definer concerns and the search path issues

-- Update all functions to have proper search_path settings

-- 1. update_updated_at_column function (this one doesn't need SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 2. set_updated_at function (this one doesn't need SECURITY DEFINER)  
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;