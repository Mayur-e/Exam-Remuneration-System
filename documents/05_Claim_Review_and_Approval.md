# Claim Review and Approval Workflow

## Overview
A multi-level verification system for auditing claims.

## Roles involved
- **Coordinator**: Department-level technical check.
- **Admin**: Final authority.

## Features & API Integration

### 1. Verification Queues
- **API Endpoints**:
  - `GET /api/coordinator/claims`: Returns claims filtered by the coordinator's assigned subjects.
  - `GET /api/admin/claims`: Returns the master list of all pending submissions.

### 2. Actions & Audit Logs
- **API Endpoints**:
  - `POST /api/coordinator/verify`: Pushes a claim from coordinator level to admin level.
  - `POST /api/admin/claims/:id/approve`: Sets status to `APPROVED`.
  - `POST /api/admin/claims/:id/reject`: Sets status to `REJECTED`.
  - `POST /api/admin/claims/:id/send-back`: Sets status back to `DRAFT` so the faculty can edit.
- **Audit**: Every action is recorded in `claim_actions`.

### 3. Claim Search & Mass Actions
- **API Endpoints**:
  - `GET /api/admin/claims/search`: Filters by PRN, Status, or Date.
  - `POST /api/admin/claims/bulk-approve`: Approves multiple selected rows.

## How to Use

### For Coordinators/Admins:
1. **Review**: Go to **Pending Reviews**. You will see a list of claims.
2. **Investigation**: Click the **View Eye Icon**.
   - Check the **Student Count** vs the official record.
   - For External claims, click **View KYC** to check their PAN card.
3. **Decide**:
   - If perfect -> **Approve**.
   - If incorrect bank detail -> **Send Back** with a remark "Fix Bank Info".
   - If duplicate -> **Reject**.
4. **Transparency**: The faculty will see your remarks immediately on their dashboard.
