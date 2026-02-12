Task: Fix Course Search to use Subjects Table
Status: Completed

Summary of Artifacts Updated:
1.  Backend Migration: `backend/migrations/002_switch_to_subjects.sql` (Executed & Deleted)
    - Dropped `courses` table.
    - Added `subject_id` to `course_assignments` and `exams`.
2.  Backend Logic:
    - Updated `coordinator.controller.js` to query `subjects` table directly.
    - Updated `faculty.controller.js` to use `subject_id` and validate against `subjects`.
3.  Frontend Logic:
    - `ExamDetails.jsx`: Updated to use `subject_id` and search logic.
    - `CourseCoordinationSettings.jsx`: Updated to use `subject_id`.
