# Dashboard and Reporting

## Overview
Visual analytics and document generation.

## Roles Involved
- **Admin**: System-wide KPIs.
- **Faculty/Staff**: Personal earnings history.

## Features & API Integration

### 1. Analytics & KPIs
- **API Endpoints**:
  - `GET /api/admin/dashboard/stats`: Returns aggregated numbers like "Total Disbursed", "Pending Claims Count", and "Active Faculty".
  - `GET /api/faculty/stats`: Returns personal metrics for the logged-in user.

### 2. Document Generation (PDF/Excel)
- **API Endpoints**:
  - `GET /api/pdf/claim/:examId/download`: Generates teaching remuneration PDF via Puppeteer.
  - `GET /api/pdf/non-teaching/:examId/download`: Generates supporting staff PDF.
  - `GET /api/admin/export/billing-sheet`: Generates an Excel bank file.

### 3. Audit Trails
- **API Endpoints**:
  - `GET /api/admin/audit-logs`: Fetches a chronological list of all system actions from the `claim_actions` table.

## How to Use

1. **KPI View**: Check the **Dashboard Charts** for volume trends across different departments.
2. **Download Slips**: 
   - Navigate to your **Paid Claims** list.
   - Click **Download PDF**. These slips are legally compliant for institutional reimbursement audits.
3. **Audit Tracking**: Admins can search the **Audit Log** for specific Claim IDs to see exactly who approved or rejected them and the timestamps of each move.
4. **Excel Exports**: Use the **Export Center** to get raw CSV/Excel data for external reporting.
