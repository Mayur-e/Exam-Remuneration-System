-- Check for duplicate draft exams in the database
SELECT 
  id,
  faculty_id,
  exam_type,
  subject_name,
  subject_code,
  claim_form_type,
  created_at,
  status
FROM exams
WHERE status = 'draft'
  AND subject_name = 'Android App Development with Kotlin'
ORDER BY created_at DESC;

-- Count duplicates
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
