-- Migration: Add is_internal column to exam_staff_members table
-- This column identifies if the staff member is internal faculty (Expert Assistant)

-- Add is_internal column
ALTER TABLE exam_staff_members
ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN exam_staff_members.is_internal IS 'True if staff member is internal faculty (auto-created Expert Assistant for NON_TEACHING claims)';

-- Create index for quick lookup of internal staff
CREATE INDEX IF NOT EXISTS idx_exam_staff_members_internal ON exam_staff_members(exam_id, is_internal) WHERE is_internal = true;
