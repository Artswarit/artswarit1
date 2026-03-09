-- Migration: Introduce escrow-based milestone status lifecycle
-- Phases:
-- 1) Create new enum with strict ordered statuses
-- 2) Migrate existing milestone.status text values to new enum values
-- 3) Attach enum type to project_milestones.status
-- 4) Add payout_id and rejection_reason columns

DO $$
BEGIN
  -- Create new enum type for escrow lifecycle if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'milestone_status_v2'
  ) THEN
    CREATE TYPE milestone_status_v2 AS ENUM (
      'LOCKED',           -- Future milestone
      'WAITING_FUNDS',    -- Current milestone, waiting for client deposit
      'ACTIVE',           -- Funded (escrowed), artist is working
      'REVIEW_PENDING',   -- Work uploaded, waiting for client review
      'REVISION_REQUESTED', -- Client requested changes
      'COMPLETED',        -- Client approved & payout released
      'DISPUTED'          -- Escalated for admin intervention
    );
  END IF;
END
$$;

-- Add new columns to project_milestones if they don't exist
ALTER TABLE public.project_milestones
  ADD COLUMN IF NOT EXISTS payout_id text,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- IMPORTANT:
-- project_milestones.status is currently text with legacy values:
-- 'pending', 'in_progress', 'submitted', 'revision_requested', 'approved', 'paid', 'disputed'
-- We map these to the new enum as best-effort defaults:
--   pending             -> WAITING_FUNDS
--   in_progress         -> ACTIVE
--   submitted           -> REVIEW_PENDING
--   revision_requested  -> REVISION_REQUESTED
--   approved            -> REVIEW_PENDING (pre-escrow approval)
--   paid                -> COMPLETED
--   disputed            -> DISPUTED

-- First, ensure all NULL/unknown statuses are set to a safe default
UPDATE public.project_milestones
SET status = COALESCE(status, 'pending');

-- Attach the new enum type to the status column
ALTER TABLE public.project_milestones
  ALTER COLUMN status TYPE milestone_status_v2
  USING (
    CASE status
      WHEN 'pending' THEN 'WAITING_FUNDS'
      WHEN 'in_progress' THEN 'ACTIVE'
      WHEN 'submitted' THEN 'REVIEW_PENDING'
      WHEN 'revision_requested' THEN 'REVISION_REQUESTED'
      WHEN 'approved' THEN 'REVIEW_PENDING'
      WHEN 'paid' THEN 'COMPLETED'
      WHEN 'disputed' THEN 'DISPUTED'
      ELSE 'WAITING_FUNDS'
    END::milestone_status_v2
  );

-- Set a sensible default for newly created milestones:
-- first milestone in a project should typically start as WAITING_FUNDS,
-- later milestones will be created as LOCKED at the application layer.
ALTER TABLE public.project_milestones
  ALTER COLUMN status SET DEFAULT 'WAITING_FUNDS';

