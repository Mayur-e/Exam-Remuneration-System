-- Script to clear all transaction/test data from the database
-- Preserves Master Data: users, subjects, batch_sizes, rates, norms, semester_counts

BEGIN;

-- Truncate transaction tables with CASCADE to handle foreign key references
-- queries: Issues/Tickets raised by faculty (references exams)
-- external_examiners: External people added for exams
-- exams: The core claim/exam record (references users, subjects)

TRUNCATE TABLE 
    queries,
    external_examiners,
    exams
RESTART IDENTITY CASCADE;

-- Note: The following tables will be automatically cleared due to CASCADE:
-- - claim_actions (references exams)
-- - query_responses (references queries)
-- - exam_documents (references exams)
-- - external_exam_links (references exams, external_examiners)
-- - payments (references exams)
-- - exam_staff_members (references exam_staff)
-- - remuneration_calculations (references exams)
-- - exam_staff (references exams)

-- Verify preservation of Master Data (Optional, for safety check)
-- users, subjects, batch_sizes, remuneration_rates, staff_role_rates, 
-- exam_staff_norms, subject_semester_counts, faculty_bank_accounts 
-- should NOT be affected.

COMMIT;

-- Output confirmation
DO $$
BEGIN
    RAISE NOTICE 'Transaction data cleared. Master data preserved.';
END $$;
