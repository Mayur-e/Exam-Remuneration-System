# Enhanced Course Coordinator Workflow

This document outlines the changes made to implementing the Course Coordinator workflow.

## Overview
A new workflow has been implemented where Faculty claims are routed to a **Course Coordinator** for verification before being sent to Billing. This ensures subject-specific oversight.

## Key Features

### 1. Course Assignment
- **Settings -> Course Coordination**: Faculty can assign themselves as the Course Coordinator for a specific subject, academic year, and semester.
- Only one faculty can be the coordinator for a subject per term.

### 2. Claim Submission
- **Generate Claim**: When creating a claim, Faculty must select a **Course** from the dropdown.
- This links the claim to the specific subject and its assigned coordinator.
- **Status**: Claims are submitted with status `UNDER_COORDINATOR_REVIEW`.
- **Exception**: Non-Teaching claims bypass this and go directly to `SENT_TO_BILLING`.

### 3. Coordinator Dashboard
- **Coordinator Dashboard** (Sidebar): A new dashboard for Coordinators to view claims assigned to them.
- **Actions**:
    - **Verify**: Sets status to `SENT_TO_BILLING`.
    - **Reject**: Sets status to `COORDINATOR_REJECTED` with a reason.

### 4. Billing
- Billing In-Charge can view verified claims (`SENT_TO_BILLING`) in their dashboard.
- Billing can approve/reject as before.

## Database Changes
- **New Tables**: `courses`, `course_assignments`.
- **Updated Tables**: `exams` (new `course_id` column, updated `status` length).
- **History**: `claim_actions` table tracks approvals and rejections.

## Setup Instructions
1.  **Populate Courses**: Ensure the `courses` table is populated with course data (Code, Name, Department). The system relies on this for the dropdowns.
2.  **Assign Coordinators**: Faculty members must log in and assign themselves to subjects via Settings.
3.  **Test**: Create a claim and verify it flows to the correct coordinator.

## Troubleshooting
- If the "Course" dropdown is empty, check the `courses` table in the database.
- If a claim is stuck in `UNDER_COORDINATOR_REVIEW`, ensure a coordinator is active for that subject/term.
