# Internal Teaching Claims

## Overview
This feature allows internal faculty members to claim remuneration for examination-related duties such as paper setting, assessment (written), and conducting oral or practical exams.

## Roles Involved
- **Faculty (Internal)**: The claimant who initiates and submits the bill.
- **Course Coordinator**: Verifies the claim before it reaches the Admin.
- **Administrator**: Final reviewer and approver of the claim.

## Features & API Integration

### 1. Claim Initiation & Drafting
- Faculty can start a draft claim and return to it later.
- **API Endpoints**:
  - `POST /api/faculty/exams`: Creates a new record in the `exams` table with status `DRAFT`.
  - `PUT /api/faculty/exams/:id`: Saves intermediate progress of the bill.
  - `DELETE /api/faculty/exams/:id`: Discards a draft bill.

### 2. Automated Rate Calculation
- The system prevents manual tampering with rates by calculating everything on the server.
- **API Endpoints**:
  - `GET /api/faculty/exams/:id/bill`: Triggers the PostgreSQL `calculate_exam` function.
- **Logic**: It checks the `students_count` against `min_per_day` benchmarks and current `academic_year_rates`.

### 3. Submission Workflow
- Once finalized, moving the bill to the review queue.
- **API Endpoints**:
  - `POST /api/faculty/exams/:id/submit`: Transitions status from `DRAFT` to `PENDING`.
  - `POST /api/faculty/exams/:id/resubmit`: Used when a bill was "Sent Back" or "Rejected" and needs a second review.

## How to Use

1. **Dashboard**: Click **Create New Bill**.
2. **Subject Mapping**: Choose your subject. The system automatically fetches the correct student capacity from `subject_semester_counts`.
3. **Data Entry**:
   - For **Written**: Enter the exact count of answer sheets.
   - For **Practical/Oral**: Enter the total students. The system will auto-calculate the number of "Batches" based on institutional rules.
4. **Calculations**: Click **View Preview**. Check if the "Minimum Allowance" flag is active (this happens if your base earning is very low).
5. **Finalize**: Click **Submit**. Your bill will move to your "Active Submissions" list, and you will receive a notification when it's approved.
