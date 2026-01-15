# Bill Generation System — React.js (Versal)

## Project Overview
A React-based application to automate bill generation for examination-related remuneration claims. Supports multiple examination bill types (Practical, Oral, Term Work, Project/Dissertation, Theory, Rechecking/Revaluation) and produces print-ready/exportable claim forms and JSON payloads for backend submission.

---

## Features & Requirements

### 1. Claim Form — Input Modules
Replicate the official remuneration claim form with the following grouped sections:

- Examiner Details
  - Full name (Examiner / Chairman)
  - Mobile number
  - Email
  - PAN (attachment required)
  - Bank details (for external examiners, cancelled cheque attachment required)

- Examination Details
  - Exam type (Practical | Oral | Term Work | Project | Dissertation | Theory | Rechecking/Revaluation)
  - Academic year
  - Semester
  - Subject name
  - Subject code

- Claim Specifics
  - Number of students
  - Number of papers
  - Rate per student / per paper
  - Calculation mode (per student, per paper, per session, etc.)

- Allowances
  - Chairman allowance
  - Local conveyance allowance
  - DA (Daily Allowance)
  - Other allowances (free-text + amount)

- Signatures & Approvals
  - Exam Section
  - Course Chairman
  - Examiner
  - Signature capture or file upload option

- Attachments
  - PAN card (mandatory)
  - Cancelled cheque (mandatory for external examiners)
  - Optional supporting documents

---

### 2. Supported Examination Types
- Practical
- Oral
- Term Work
- Project / Seminar / Dissertation (including MOOCs)
- Theory paper checking (including Rechecking, Moderation, Revaluation)

Each type should allow configurable rate rules and specific input fields as required.

---

### 3. Calculations & Financial Rules
- Total remuneration = Sum(rate × count) + Sum(allowances)
- Support multiple line-items (e.g., multiple papers / sessions)
- Tax & deductions:
  - Apply TDS rules (configurable percentage)
  - Show deduction breakdown and net payable
- Revenue stamp validation:
  - If net payable > ₹5,000, require revenue stamp validation/signature
- Display totals:
  - Numeric and words (currency spelled out)
  - Row-level and grand totals

---

### 4. Validation Rules
- Required field validation for mandatory fields
- Numeric fields must prevent non-numeric input and validate ranges
- Date fields use calendar pickers; validate format & logical ranges
- PAN format validation (alpha-numeric pattern)
- Bank account validation (basic IBAN/IFSC checks where applicable)
- File upload validation (allowed types, max size)
- Clear, accessible error messages for each invalid field

---

### 5. UI Design & Components
Use modular, reusable React components:

- ClaimForm (page orchestrator)
- FormSection (grouping)
- InputField (text / number)
- SelectDropdown
- DatePicker
- FileUpload
- SignaturePad (or file upload)
- AmountSummary (totals, TDS, net)
- PrintPreview / PDFExport

Design notes:
- Responsive layout (desktop first, mobile friendly)
- Accessible labels & focus management
- Print-friendly styles and a print preview mode
- Provide stepper or collapsible sections for long forms

---

### 6. State & Data Management
- Use React Context or Redux for global form state
- Local component state for ephemeral UI state
- Persist drafts (localStorage or backend) with save/load capability
- Prepare final submission payload in a documented JSON schema
- Support "validate-only" endpoint call before final submit

Suggested JSON shape (example)
{
  "examiner": { "name": "", "mobile": "", "email": "", "panFileId": "" },
  "examDetails": { "type": "", "year": "", "semester": "", "subject": "", "code": "" },
  "claims": [ { "description": "", "count": 0, "rate": 0, "amount": 0 } ],
  "allowances": [ { "label": "", "amount": 0 } ],
  "deductions": { "tdsPercent": 0, "tdsAmount": 0 },
  "totals": { "gross": 0, "deductions": 0, "net": 0, "inWords": "" },
  "attachments": { "pan": "", "cheque": "" },
  "signatures": { "examSection": "", "chairman": "", "examiner": "" }
}

---

### 7. Security & Privacy
- Securely handle personal and financial data
- Use HTTPS for backend calls
- Encrypt sensitive fields in transit; follow storage minimization
- Access control for draft retrieval and submissions
- Clear data retention and deletion policy noted in UI

---

### 8. File Uploads & Attachments
- Mandatory PAN upload
- Mandatory cancelled cheque for external examiners
- Allowed formats: PDF, PNG, JPG
- Max file size: configurable (suggest 5 MB)
- Show preview and validation errors

---

### 9. Validation & Business Rules Documentation
- Maintain a single source of truth for rates, allowances, TDS rules
- Provide admin/config UI (or config file) to update rate tables
- Include sample test data and example scenarios in repository

---

### 10. Export / Print
- Print preview matching printed claim layout
- PDF export with embedded attachments summary
- Include watermark or generation metadata (timestamp, user id) if required

---

## Deliverables
- Complete React app implementing above features
- Reusable, well-commented components
- Unit tests for key calculation and validation logic
- README with:
  - Setup and run instructions
  - Sample test data
  - JSON schema for backend submission
- Print-ready PDF export and sample generated claims

---

## Implementation Notes & Priorities
1. Core: Forms, calculations, validation, attachments, and print/export.
2. Next: Draft persistence, admin rate configuration, and user accounts.
3. Optional: OCR for PAN/cheque, signature verification, e-sign integration.

---

## Acceptance Criteria
- All required fields validated and enforce file uploads where mandated
- Accurate calculations with TDS and revenue-stamp enforcement
- Exportable PDF with totals and signatures
- Save/load draft working reliably
- Unit tests covering calculation logic and key validators

---

