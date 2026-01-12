
-- Create milestone status enum
DO $$ BEGIN
  CREATE TYPE milestone_status AS ENUM (
    'pending', 'in_progress', 'submitted', 'revision_requested', 'approved', 'paid', 'disputed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create dispute status enum
DO $$ BEGIN
  CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved_approved', 'resolved_revision', 'resolved_cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS terms_accepted_by uuid,
ADD COLUMN IF NOT EXISTS reference_files jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS auto_approve_days integer DEFAULT 3;

-- Drop and recreate project_milestones with new structure
DROP TABLE IF EXISTS public.project_milestones CASCADE;

CREATE TABLE public.project_milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  deliverables text,
  amount numeric NOT NULL DEFAULT 0,
  due_date timestamp with time zone,
  status text NOT NULL DEFAULT 'pending',
  sort_order integer NOT NULL DEFAULT 0,
  revision_count integer DEFAULT 0,
  max_revisions integer DEFAULT 3,
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  paid_at timestamp with time zone,
  auto_approve_at timestamp with time zone,
  payment_link text,
  payment_id text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on project_milestones
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_milestones
CREATE POLICY "Users can view milestones for their projects"
ON public.project_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.client_id = auth.uid() OR p.artist_id = auth.uid())
  )
);

CREATE POLICY "Users can create milestones for their projects"
ON public.project_milestones FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.client_id = auth.uid() OR p.artist_id = auth.uid())
    AND p.is_locked = false
  )
);

CREATE POLICY "Users can update milestones for their projects"
ON public.project_milestones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.client_id = auth.uid() OR p.artist_id = auth.uid())
  )
);

CREATE POLICY "Users can delete milestones for unlocked projects"
ON public.project_milestones FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.client_id = auth.uid() OR p.artist_id = auth.uid())
    AND p.is_locked = false
  )
);

-- Create milestone_submissions table
CREATE TABLE public.milestone_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id uuid NOT NULL REFERENCES public.project_milestones(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL,
  notes text,
  is_final boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.milestone_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project participants can view submissions"
ON public.milestone_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_milestones m
    JOIN public.projects p ON p.id = m.project_id
    WHERE m.id = milestone_id
    AND (p.client_id = auth.uid() OR p.artist_id = auth.uid())
  )
);

CREATE POLICY "Artists can create submissions"
ON public.milestone_submissions FOR INSERT
WITH CHECK (
  submitted_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.project_milestones m
    JOIN public.projects p ON p.id = m.project_id
    WHERE m.id = milestone_id
    AND p.artist_id = auth.uid()
  )
);

-- Create submission_files table
CREATE TABLE public.submission_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES public.milestone_submissions(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size integer,
  is_preview boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project participants can view submission files"
ON public.submission_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.milestone_submissions s
    JOIN public.project_milestones m ON m.id = s.milestone_id
    JOIN public.projects p ON p.id = m.project_id
    WHERE s.id = submission_id
    AND (p.client_id = auth.uid() OR p.artist_id = auth.uid())
  )
);

CREATE POLICY "Artists can upload submission files"
ON public.submission_files FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.milestone_submissions s
    JOIN public.project_milestones m ON m.id = s.milestone_id
    JOIN public.projects p ON p.id = m.project_id
    WHERE s.id = submission_id
    AND p.artist_id = auth.uid()
  )
);

-- Create milestone_revisions table
CREATE TABLE public.milestone_revisions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id uuid NOT NULL REFERENCES public.project_milestones(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL,
  reason text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.milestone_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project participants can view revisions"
ON public.milestone_revisions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_milestones m
    JOIN public.projects p ON p.id = m.project_id
    WHERE m.id = milestone_id
    AND (p.client_id = auth.uid() OR p.artist_id = auth.uid())
  )
);

CREATE POLICY "Clients can request revisions"
ON public.milestone_revisions FOR INSERT
WITH CHECK (
  requested_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.project_milestones m
    JOIN public.projects p ON p.id = m.project_id
    WHERE m.id = milestone_id
    AND p.client_id = auth.uid()
  )
);

-- Create disputes table
CREATE TABLE public.disputes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES public.project_milestones(id) ON DELETE SET NULL,
  raised_by uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open',
  resolution text,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project participants can view their disputes"
ON public.disputes FOR SELECT
USING (
  raised_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.client_id = auth.uid() OR p.artist_id = auth.uid())
  ) OR
  public.is_admin(auth.uid())
);

CREATE POLICY "Project participants can create disputes"
ON public.disputes FOR INSERT
WITH CHECK (
  raised_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.client_id = auth.uid() OR p.artist_id = auth.uid())
  )
);

CREATE POLICY "Admins can update disputes"
ON public.disputes FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Create dispute_evidence table
CREATE TABLE public.dispute_evidence (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispute_id uuid NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL,
  description text,
  file_url text,
  file_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dispute participants can view evidence"
ON public.dispute_evidence FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.disputes d
    JOIN public.projects p ON p.id = d.project_id
    WHERE d.id = dispute_id
    AND (p.client_id = auth.uid() OR p.artist_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);

CREATE POLICY "Dispute participants can submit evidence"
ON public.dispute_evidence FOR INSERT
WITH CHECK (
  submitted_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.disputes d
    JOIN public.projects p ON p.id = d.project_id
    WHERE d.id = dispute_id
    AND (p.client_id = auth.uid() OR p.artist_id = auth.uid())
  )
);

-- Create user_warnings table for reputation system
CREATE TABLE public.user_warnings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  reason text NOT NULL,
  issued_by uuid,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own warnings"
ON public.user_warnings FOR SELECT
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage warnings"
ON public.user_warnings FOR ALL
USING (public.is_admin(auth.uid()));

-- Create project_activity_logs table
CREATE TABLE public.project_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES public.project_milestones(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.project_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project participants can view activity logs"
ON public.project_activity_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (p.client_id = auth.uid() OR p.artist_id = auth.uid())
  ) OR public.is_admin(auth.uid())
);

CREATE POLICY "System can create activity logs"
ON public.project_activity_logs FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_milestones_project ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_submissions_milestone ON public.milestone_submissions(milestone_id);
CREATE INDEX IF NOT EXISTS idx_disputes_project ON public.disputes(project_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);
CREATE INDEX IF NOT EXISTS idx_activity_project ON public.project_activity_logs(project_id);

-- Create storage bucket for milestone submissions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('milestone-submissions', 'milestone-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for milestone-submissions bucket
CREATE POLICY "Artists can upload submission files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'milestone-submissions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Project participants can view submission files"
ON storage.objects FOR SELECT
USING (bucket_id = 'milestone-submissions');

CREATE POLICY "Artists can delete their submission files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'milestone-submissions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Trigger for updated_at
CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON public.project_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
