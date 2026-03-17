# Non-Teaching Claims

## Overview
Handles wages for lab assistants, peons, and supporting staff. Calculates payments based on daily rates and complex institutional "Staff Norms."

## Roles Involved
- **Faculty (Expert Assistant)**: Initiates the bill and manages the staff.
- **Support Staff**: Beneficiaries.
- **Administrator**: Approver.

## Features & API Integration

### 1. Staff Roster Builder
- Allows adding multiple members to a single exam bill.
- **API Endpoints**:
  - `POST /api/faculty/exams/:id/staff`: Appends a member to `exam_staff_members`.
  - `DELETE /api/faculty/exams/:id/staff/:memberId`: Removes a member from the roster.
  - `GET /api/faculty/staff-rates`: Fetches global daily roles and their corresponding pay (Prep, Exam, Clean).

### 2. Norms Validation Engine
- React checks entries against a set of constraints defined in `exam_staff_norms`.
- **API Integration**:
  - `GET /api/faculty/norms`: Fetches the rules (e.g., Max Lab Assistants allowed for 50 students = 1).
- Frontend logic disables the "Add Member" button if the student count doesn't justify extra personnel.

### 3. Calculation Preview
- **API Endpoints**:
  - `GET /api/faculty/exams/:id/non-teaching-bill`: Computes the unique formula:
    `Wage = (PrepRate * PrepDays) + (ExamRate * Batches * ExamDays) + (CleanRate * CleanDays)`.

## How to Use

1. **Initiate**: Select **Non-Teaching Claim**.
2. **Setup**: Enter the **Exam Dates**, **Student Count**, and number of **Batches**.
3. **Add Staff**:
   - Add yourself as the **Expert Assistant** (Note: You only earn for Exam Days/Batches).
   - Add Lab Assistants and Peons. Select their roles from the dropdown.
4. **Days Distribution**:
   - Assign **Preparation Days** (e.g., 1 day for a Lab Assistant).
   - Assign **Exam Days** (e.g., 3 days if the oral exam spans 3 days).
   - Assign **Cleaning Days** (e.g., 1 day after the exam finishes).
5. **Validation**: If the system says "Staff limit exceeded," you must reduce the number of staff members based on the student count.
6. **Submit**: Once verified, submit for the Admin to review.
