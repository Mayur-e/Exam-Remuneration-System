-- Add fields for Non-Teaching claim form
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS prep_dates TEXT,
ADD COLUMN IF NOT EXISTS exam_dates TEXT,
ADD COLUMN IF NOT EXISTS cleaning_dates TEXT,
ADD COLUMN IF NOT EXISTS students_per_batch INTEGER;

-- Add rate field to exam_staff_members table
ALTER TABLE exam_staff_members
ADD COLUMN IF NOT EXISTS rate NUMERIC(10,2) DEFAULT 0;

COMMENT ON COLUMN exams.prep_dates IS 'Comma-separated preparation dates for non-teaching claims';
COMMENT ON COLUMN exams.exam_dates IS 'Comma-separated examination dates for non-teaching claims';
COMMENT ON COLUMN exams.cleaning_dates IS 'Comma-separated cleaning dates for non-teaching claims';
COMMENT ON COLUMN exams.students_per_batch IS 'Number of students per batch for non-teaching claims';
COMMENT ON COLUMN exam_staff_members.rate IS 'Rate per day for the staff member';
