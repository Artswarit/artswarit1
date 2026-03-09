-- Drop the old status check constraint
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Add new status check constraint that includes 'accepted'
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]));