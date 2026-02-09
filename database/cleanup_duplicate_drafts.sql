-- Clean up duplicate draft entries
-- This script removes duplicate draft exams, keeping only the most recent one for each unique combination

WITH duplicates AS (
  SELECT 
    id,
    faculty_id,
    exam_type,
    subject_name,
    subject_code,
    claim_form_type,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY faculty_id, exam_type, subject_name, subject_code, claim_form_type, status
      ORDER BY created_at DESC
    ) as row_num
  FROM exams
  WHERE status = 'draft'
)
DELETE FROM exams
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE row_num > 1
);

-- Show remaining drafts after cleanup
SELECT 
  faculty_id,
  exam_type,
  subject_name,
  claim_form_type,
  COUNT(*) as count
FROM exams
WHERE status = 'draft'
GROUP BY faculty_id, exam_type, subject_name, claim_form_type
HAVING COUNT(*) > 1;
