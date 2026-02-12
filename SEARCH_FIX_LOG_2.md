Task: Fix Course Search (Revert to separate Courses table)
Status: Completed

Summary of Artifacts Updated:
1.  Backend Migration: `backend/migrations/003_revert_to_courses.sql` (Executed & Deleted)
    - Re-created `courses` table.
    - Populated `courses` from `subjects`.
    - Added `course_id` back to `course_assignments` and `exams`.
2.  Backend Logic:
    - Updated `coordinator.controller.js` to query `courses` table.
    - Updated `faculty.controller.js` to use `course_id` and validate against `courses`.
3.  Frontend Logic:
    - `ExamDetails.jsx`: Reverted to use `course_id`.
    - `CourseCoordinationSettings.jsx`: Reverted to use `course_id`.
