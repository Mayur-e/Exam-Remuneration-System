Task: Implement Enhanced Course Coordinator Workflow
Status: Completed

Summary of Artifacts Created/Updated:
1.  Backend Migration: `backend/migrations/001_implement_coordinator_schema.sql` (Executed & Deleted)
2.  Backend Logic:
    - `backend/src/controllers/coordinator.controller.js` (Assignments, claim verification)
    - `backend/src/controllers/faculty.controller.js` (Course selection, status updates)
    - `backend/src/controllers/accountant.controller.js` (Updated queries for new statuses)
    - `backend/src/routes/coordinator.routes.js`
3.  Frontend Logic:
    - `frontend/src/components/settings/CourseCoordinationSettings.jsx`
    - `frontend/src/pages/coordinator/CoordinatorDashboard.jsx`
    - `frontend/src/pages/faculty/ExamDetails.jsx` (Searchable Course Input)
    - `frontend/src/pages/faculty/Settings.jsx` (Settings tab)
    - `frontend/src/pages/faculty/FacultyLayout.jsx` (New nav item)
    - `frontend/src/routes/AppRoutes.jsx` (New route)
4.  Documentation: `README_COORDINATOR.md`

Next Steps for User:
- Ensure database `courses` table is populated.
- Assign roles/departments correctly in `users` table.
- Test workflow end-to-end.
