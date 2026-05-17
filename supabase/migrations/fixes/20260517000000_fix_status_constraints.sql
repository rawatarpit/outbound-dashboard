-- Fix status CHECK constraints to match frontend enums
-- leads.status: frontend uses ['new', 'researching', 'qualified', 'icp_passed', 'contacted', 'replied', 'negotiating', 'closed_won', 'closed_lost']
-- companies.status: frontend uses ['researching', 'qualified', 'icp_passed', 'draft_ready', 'contacted', 'replied', 'negotiating', 'closed_won', 'closed_lost']

-- Drop existing CHECK constraints
ALTER TABLE IF EXISTS public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE IF EXISTS public.companies DROP CONSTRAINT IF EXISTS companies_status_check;

-- Add new CHECK constraints matching frontend enums
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
  'qualified'::text,
  'icp_passed'::text,
  'draft_ready'::text,
  'contacted'::text,
  'replied'::text,
  'negotiating'::text,
  'closed_won'::text,
  'closed_lost'::text
]));

-- Recreate indexes for performance (they were dropped when constraints were dropped)
DROP INDEX IF EXISTS idx_leads_status;
DROP INDEX IF EXISTS idx_companies_status;
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_companies_status ON public.companies(status);