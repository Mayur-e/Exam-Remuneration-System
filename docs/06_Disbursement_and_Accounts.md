# Disbursement and Accounts Management

## Overview
Transitions approved digital bills into financial transactions.

## Roles Involved
- **Accountant (Billing In-charge)**: Executes payments and tracks settlement.

## Features & API Integration

### 1. Payment Processing
- Moving bills from `APPROVED` to `PAID`.
- **API Endpoints**:
  - `GET /api/accountant/claims`: Fetches all approved claims ready for payout.
  - `POST /api/accountant/claims/:id/pay`: Finalizes the transaction and saves the UTR reference.

### 2. Financial Exports
- Generating data for bank portal uploads.
- **API Endpoints**:
  - `GET /api/admin/export/billing-sheet`: Returns an Excel file (`exceljs`) containing Account Numbers, IFSC, and Net Amounts for all approved bills.

### 3. Ledger Management
- Viewing the history of paid remuneration.
- **API Endpoints**:
  - `GET /api/accountant/payments`: Fetches the `payments` table joined with claim metadata.

## How to Use

1. **Dashboard**: Navigate to the **Accounts Portal**.
2. **Export**: Click **Download Bank Sheet**. Select the date range or batch of claims.
3. **Execution**: Perform the bank transfers using your institutional banking portal based on the Excel data.
4. **Mark Settlement**:
   - For each successful transfer, click **Mark Paid**.
   - Paste the **UTR / Reference Number** in the popup.
5. **Report**: At the end of the month, download the **Monthly Payout Report** for auditing.
