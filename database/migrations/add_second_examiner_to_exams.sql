-- Migration: Add second examiner field to exams table
-- This allows recording the name of the second examiner for the claim form

ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS second_examiner VARCHAR(200);

-- Add comment
COMMENT ON COLUMN exams.second_examiner IS 'Name of the second examiner (if any)';
