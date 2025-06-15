
-- 1. Create a role enum for platform roles.
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'artist', 'client');

-- 2. Create a user_roles mapping table (decouples roles from profiles, for future flexibility).
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Security-definer function to check if user is admin.
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  );
$$;

-- 4. (Optional, but strongly recommended) Create policy for projects table so only admins can update/delete all, but owners can update their own.
DROP POLICY IF EXISTS "Update own projects only" ON public.projects;
CREATE POLICY "Admins can update all projects"
  ON public.projects
  FOR UPDATE
  USING (public.is_admin(auth.uid()) OR artist_id = auth.uid() OR client_id = auth.uid());

-- 5. (Optional) Add similar policies for profiles, artworks, etc as needed for admin functionality.
-- You can repeat this pattern for tables you want admins to moderate (replace 'public.projects' with relevant table name).

-- 6. (Optional) Grant SELECT/UPDATE/DELETE on all tables to admin via RLS by adding policies where needed.

