# System Configuration and Rates Management

## Overview
Administrative control panel for system rules, wages, and academic limits.

## Roles Involved
- **Administrator**: Exclusive access.

## Features & API Integration

### 1. Global Rate Management
- **API Endpoints**:
  - `GET /api/admin/rates`: Fetches current multiplier values for all exam types.
  - `PUT /api/admin/rates/:id`: Updates a specific rate (e.g., Oral Rate from Rs. 20 to Rs. 25).
  - `POST /api/admin/rates/clone`: Automates year-end maintenance by copying all rates from the current year to the next one.

### 2. Staff Wage Configuration
- **API Endpoints**:
  - `GET /api/admin/staff-rates`: Fetches daily wages for lab/office support staff.
  - `PUT /api/admin/staff-rates/:roleId`: Edits role-specific allowances.

### 3. Subject Volume Control
- **API Endpoints**:
  - `POST /api/admin/subjects/counts`: Upserts values into `subject_semester_counts`.
- **Validation**: When a faculty tries to claim for 70 students, but this API has the limit set at 60, the claim is blocked.

## How to Use

1. **Update Rates**: 
   - Go to **Settings > Manage Rates**.
   - Update the "Minimum Per Day" value if there's an institutional policy change.
2. **New Term Setup**:
   - Use the **Clone Year** button.
   - Select "2024-25" as source and "2025-26" as target.
3. **Limit Overrides**:
   - If an elective subject has more students than usual, go to **Subject Capacity**.
   - Search for the subject code.
   - Increase the "Allowed Student Count" to allow faculty to submit their bills.
4. **Staff Roles**: Update the "Preparation" or "Cleaning" rates in the **Supporting Staff Rules** tab.
