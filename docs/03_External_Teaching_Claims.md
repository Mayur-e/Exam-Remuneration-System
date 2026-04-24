# External Teaching Claims

## Overview
Facilitates remuneration for guest examiners via magic links, ensuring frictionless data entry and document collection.

## Roles Involved
- **Internal Faculty (Coordinator)**: Spawns the guest link.
- **External Examiner**: Fills the form and uploads KYC.
- **Administrator**: Final audit.

## Features & API Integration

### 1. Magic Link System
- Secure tokens are generated for specific exam IDs.
- **API Endpoints**:
  - `POST /api/faculty/exams/:id/external-link`: Mints a token and stores it in `external_exam_links`.
  - `GET /api/external/validate-link/:token`: Public endpoint to check if a link is expired or already used.

### 2. Travel Allowance (TA/LCA) Logic
- Handles dynamic travel costs based on distance.
- **API Endpoints**:
  - `PUT /api/external/claims/:token/allowances`: Updates the TA amount and distance category (Local < 25km vs Outstation > 25km).

### 3. Submission & KYC Verification
- Blocks submission until mandatory files are present.
- **API Endpoints**:
  - `POST /api/external/claims/:token/submit`: Merges the guest's bank info into `external_examiners` and submits the bill.

## How to Use

### For Internal Faculty (Coordinator):
1. Locate the subject in your dashboard.
2. Click **Generate Guest Link**.
3. Choose the guest's institute (or add a new one).
4. Share the URL. You can track if the guest has opened the link via the "Link Status" badge in your exam list.

### For External Examiner:
1. **Details**: Enter your Name, PAN, and Bank info correctly.
2. **Duty**: Verify the exam dates and student counts.
3. **Travel**: 
   - If **Local**, the system auto-applies the Rs. 500 flat fee. 
   - If **Outstation**, enter your actual fare and upload your tickets/receipts for audit.
4. **Documents**: Use the file picker to upload a clear photo of your PAN and Bank Cheque.
5. **Submit**: Once submitted, you cannot edit the details. For corrections, contact the Internal Coordinator.
