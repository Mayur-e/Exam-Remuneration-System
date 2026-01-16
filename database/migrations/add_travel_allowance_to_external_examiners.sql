-- Migration: Add travel allowance columns to external_examiners table
-- This supports LCA (Local Conveyance Allowance) and TA/DA for external examiners

ALTER TABLE public.external_examiners
ADD COLUMN IF NOT EXISTS is_local BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS journey_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS travel_allowance NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS travel_proof_url TEXT;

-- Add comments
COMMENT ON COLUMN public.external_examiners.is_local IS 'True if examiner is within 25km of PCCOE, False if beyond 25km';
COMMENT ON COLUMN public.external_examiners.journey_days IS 'Number of days/visits for LCA calculation (< 25km only)';
COMMENT ON COLUMN public.external_examiners.travel_allowance IS 'Calculated LCA (500 × days) or user-entered total travel expense (> 25km)';
COMMENT ON COLUMN public.external_examiners.travel_proof_url IS 'URL to uploaded travel proof document (tickets, bills) for outstation examiners';
