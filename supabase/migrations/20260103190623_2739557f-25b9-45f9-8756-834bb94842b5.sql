-- Add progress column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);

-- Update existing projects based on status
UPDATE public.projects SET progress = 50 WHERE status = 'accepted' AND progress = 0;
UPDATE public.projects SET progress = 100 WHERE status = 'completed' AND progress < 100;