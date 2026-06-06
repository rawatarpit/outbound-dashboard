-- Fix status CHECK constraints to include all engine + frontend statuses
-- Engine uses: researching, researching_processing, qualified, qualified_processing,
--   icp_passed, rejected, draft_ready, draft_ready_processing, contacted,
--   replied, replied_processing, negotiating, negotiating_processing,
--   closed_won, closed_lost, dead_letter, meeting_booked

-- Drop existing CHECK constraints
ALTER TABLE IF EXISTS public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE IF EXISTS public.companies DROP CONSTRAINT IF EXISTS companies_status_check;

-- Add new CHECK constraints matching both engine and frontend
ALTER TABLE public.leads
ADD CONSTRAINT leads_status_check
CHECK (status = ANY (ARRAY[
  'new'::text,
  'researching'::text,
  'qualified'::text,
  'icp_passed'::text,
  'contacted'::text,
  'replied'::text,
  'negotiating'::text,
  'closed_won'::text,
  'closed_lost'::text
]));

ALTER TABLE public.companies
ADD CONSTRAINT companies_status_check
CHECK (status = ANY (ARRAY[
  'researching'::text,
  'researching_processing'::text,
  'qualified'::text,
  'qualified_processing'::text,
  'icp_passed'::text,
  'rejected'::text,
  'draft_ready'::text,
  'draft_ready_processing'::text,
  'contacted'::text,
  'replied'::text,
  'replied_processing'::text,
  'negotiating'::text,
  'negotiating_processing'::text,
  'meeting_booked'::text,
  'closed_won'::text,
  'closed_lost'::text,
  'dead_letter'::text
]));

-- Recreate indexes for performance (they were dropped when constraints were dropped)
DROP INDEX IF EXISTS idx_leads_status;
DROP INDEX IF EXISTS idx_companies_status;
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_companies_status ON public.companies(status);
