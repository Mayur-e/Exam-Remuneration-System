# Full System Working Document & Architecture Overview

This comprehensive document serves as the master guide to the Exam Remuneration System, detailing the technology choices, database structure, module breakdown, complex workflows, and API architectures.

---

## 1. Complete Technology Stack & Modules used

### Frontend Technologies
- **Framework**: React 19.2 (using Vite builder for fast HMR and optimized builds)
- **Routing**: `react-router-dom` (v7 SPA routing)
- **Styling**: `tailwindcss` (Utility-first CSS), `autoprefixer`, `postcss`
- **UI Components & Animations**: 
  - `@radix-ui/react-slot` (Provides accessible unstyled headless UI components)
  - `framer-motion` (Declarative animations & page transitions)
  - `tailwindcss-animate` (Tailwind animation plugins)
- **API Communication**: `axios` (Promise-based HTTP client using interceptors to inject JWTs seamlessly)
- **Authentication**: `@react-oauth/google` (Google OAuth 2.0 integration for faculty SSO)

### Backend Technologies
- **Runtime Environment**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: PostgreSQL (`pg` module directly interacting with SQL without a heavy ORM for maximum query performance)
- **Authentication & Security**:
  - `jsonwebtoken` (Standard JWT creation for stateless auth)
  - `bcrypt` (Salted password hashing logic)
  - `helmet` (Middlware securing Express apps by setting various HTTP headers)
  - `cors` (Cross-Origin Resource Sharing)
  - `express-rate-limit` (Brute-force/DDoS protection on critical routes)
  - `express-validator` (Input validation logic acting as a middleware gateway)
  - `google-auth-library` (Verification of Google id-tokens securely on the server side)
- **File Handling & Generation Utilities**:
  - `multer` (Handling `multipart/form-data` for KYC document uploads)
  - `exceljs` (Generating comprehensive, multi-sheet [.xlsx](file:///d:/Bill/exam-remuneration-system/billing_template.xlsx) billing arrays)
  - `puppeteer` (Headless browser engine mapping HTML templates to generate high-fidelity PDF remuneration slips)
- **Configuration**: `dotenv` (Environment variable extraction)

---

## 2. Database Schema & Core Entities

The PostgreSQL schema is highly relational, utilizing triggers and procedures to maintain state integrity across an academic term.

1. **Identity & Auth**:
   - `users`: Core identity table (Prn, Email, Role: `FACULTY`, `ADMIN`, `BILLING_INCHARGE`).
   - `faculty_bank_accounts`: 1-to-1 relationship with `users` storing IFSC, PAN, and KYC verification statuses.
2. **Academic Structure Blueprint**:
   - `courses` & `course_assignments`: Master directory of university courses and coordinating faculty.
   - `subjects`: Master subjects dictionary.
   - `subject_semester_counts`: Max allowed student registrations per subject, categorized by `academic_year` and `semester`.
3. **Rates & Regulations (The Billing Engine)**:
   - `remuneration_rates`: Defines payouts per student checked (FY/SY vs TY/Final rates) and minimum daily benchmarks.
   - `staff_role_rates`: Defines the daily allowance for Lab Assistants, Peons, etc.
   - `batch_sizes`: Determines the number of students standardizing a single practical/oral "batch".
   - `exam_staff_norms`: Defines the strict maximum configurations (e.g., maximum prep days allowed based on student volume).
4. **Transactions (Claims)**:
   - `exams`: The central master bill record mapping to the faculty or external supervisor.
   - `exam_staff` & `exam_staff_members`: Sub-tables defining individual helpers assigned to a specific `NON_TEACHING` exam.
   - `remuneration_calculations`: Final computed breakdown matching the rates against the claimed parameters (calculated via Postgres `calculate_exam` function).
5. **External Coordination**:
   - `external_exam_links`: Ephemeral table containing magic links with expirations.
   - `external_examiners`: Stores demographics & uploaded URLs for external teachers.
6. **Support & Audits**:
   - `claim_actions`: History trail of claim movements (Rejections/Approvals alongside Remarks).
   - `queries` & `query_responses`: Faculty ticketing system to resolve payout delays.
   - `payments`: Maps an approved `exam` claim to a Bank NEFT Reference Number.

---

## 3. Comprehensive System Workflows

### A. The "Teaching Internal" Claim Workflow 
*Purpose: Disbursing payouts to permanent or ad-hoc faculty members within the parent university for exam grading duties.*
1. **Initiation**: Internal Faculty navigates to `/faculty/dashboard` and initiates an "Internal Teaching Duty" bill.
2. **Duty Parameter Input**: 
   - Modifiers captured: `Subject Code/Name`, `Course Level (TY/FY/BTECH/MTECH)`, `Exam Format (Written Term Work, Oral, Practical)`.
   - Core Metric: `Number of Students Assessed`.
3. **Draft Engine Processing**: 
   - The React app dispatches a `POST /api/faculty/exams` payload.
   - The Postgres `calculate_exam` function dynamically reads the current `academic_year` multipliers in `remuneration_rates` (`fy_sy_rate`, `ty_final_rate`).
   - The total computes as `Gross = Rate * Batch Allowed Constraints (if Practical) OR Pure Student Count (if Written)`.
   - It validates against the minimum rule (if `Gross < min_per_day`, then force `Gross = min_per_day`).
4. **Finalization**: Displays real-time breakdown via `GET /api/faculty/exams/:id/bill`. Faculty formally `SUBMITS` the record, forwarding it to `PENDING` state on Admin.

### B. The "Teaching External" Claim Workflow
*Purpose: Disabling friction to facilitate payments to Guest Examiners or external campus invites performing Orals/Practicals.*
1. **Link Minting (By Internal Coordinator)**: 
   - The Internal Subject Lead spawns an external wrapper claim (`TEACHING_EXTERNAL`). 
   - A secure, expiring token is minted (`POST /api/faculty/exams/:id/external-link`). 
2. **Guest Engagement**: The generated URL is manually emailed to the Guest Examiner. They click the link; skipping traditional Authentication entirely.
3. **Mandatory KYC & Disclosures**:
   - The interface requires basic demographics: `Full Name`, `Parent Institute`, `Bank Account`, `IFSC Code`.
   - **Critical Path**: System blocks submission unless scanned `PAN Card` and `Cancelled Cheque` images are uploaded successfully (`multer` stores into `/uploads`).
4. **Travel Allowances (LCA)**: 
   - External Examiner specifies if they traveled `> 25km` or `< 25km`.
   - If Local (`< 25km`), they receive a standard Rs. 500/day allowance multiplied by days visited.
   - If Outstation (`> 25km`), they manually input their Total Train/Bus fare and upload strict photographic proof.
5. **Seamless Merge**: Guest clicks Submit. The system updates the original claim entity to `PENDING` ensuring it sits identically side-by-side with Internal Claims on the Admin Desk.

### C. The "Non-Teaching" Claim Workflow
*Purpose: Issuing daily allowances specifically for Laboratory Support Staff, Peons, and administrative assistants running the exam logistics.*
1. **Primary Assignment**: Faculty initiates a "Non-Teaching Claim" mapped to a subject. The faculty themselves is designated immediately as the "Expert Assistant" ensuring they receive the baseline batch oversight fees.
2. **Staff Roster Construction**: 
   - Faculty manually inputs supporting members: `John Doe - Lab Assistant`, `Jane Smith - Peon`.
3. **Rigid Logistical Constraints**: 
   - Faculty adds specific input numeric: `Preparation Days`, `Exam Days`, and `Cleaning Days`.
   - Security Check: System validates days against `exam_staff_norms`. (If regular 50-student exam, the max allowed `Cleaning Day` = 1. The UX inherently restricts faculty entering "5 Cleaning Days" erroneously).
4. **Specialized Rate Computation**: 
   - Calculations decouple from straight student counts into daily wages.
   - `Gross Wage = (Preparation Rate * Prep Days) + (Batch Multipler Rate * Total Batches * Exam Days) + (Cleaning Rate * Clean Days)`.
   - **Note on Expert Assistant**: Faculty designated as Expert Assistants mathematically CANNOT earn Prep or Cleaning rates.

### D. The Audit & Accounts Pipeline
1. `ADMIN` logs in. Views the verification queue pulling all `PENDING` items.
2. The dashboard exhibits the detailed itemization. The admin approves the bill.
3. `BILLING_INCHARGE` (Accounts) exports a [.xlsx](file:///d:/Bill/exam-remuneration-system/billing_template.xlsx) Excel sheet detailing Account Numbers, IFSC codes, and Total Amounts.
4. Bank transfers are made externally. The Accounts panel flags the rows in the UI as `PAID` via bulk operations. A `payment` record mapping the UTR transaction number to the claim ID is logged.
5. `puppeteer` generates an official formatted PDF "Remuneration Slip" available for institutional auditing.

---

## 4. API Endpoints Map

### A. Global Auth Endpoints (`/api/auth`)
- `POST /login` -> Validate Email/PW schema. Signs a JWT.
- `POST /register` -> Appends a user to `users` with hashed bcrypt password.
- `POST /change-password` -> Standard password change mechanism.
- `POST /google/check` & `POST /google/register` -> OIDC (OpenID Connect) verification checking the token audience via Google libraries.

### B. Administrative Commands (`/api/admin`)
- **Reporting**:
  - `GET /dashboard/stats` -> High-level analytic aggregations.
  - `GET /audit-logs` -> Pulls from `claim_actions`.
- **Claims**:
  - `GET /claims` -> Master grid data fetch mapping joins across `exams` and `remuneration_calculations`.
  - `POST /claims/:id/reject` -> Registers a rejection in `claim_actions` and sets `exams` table status.
  - `POST /claims/:id/send-back` -> Soft revert mapping minimal corrections.
- **Master Data Controllers**:
  - `GET /rates` / `PUT /rates` -> Configure global variable multipliers (`remuneration_rates`).
  - `POST /rates/clone` -> Bootstraps records for a new academic year mapping previously set arrays.
  - `POST /subjects/counts` -> `ON CONFLICT` Upsert adding strict student capacity logic via `subject_semester_counts`.
  - `GET /subjects/search` -> Query utility probing the `subjects` dictionary.
- **Outputs**:
  - `GET /export/billing-sheet` -> Emits binary payload containing the bank processing structure (`exceljs`).

### C. Faculty Interfaces (`/api/faculty`)
- **Self Service**:
  - `GET /profile` / `PUT /profile` -> Account settings (Email, mobile, department).
- **Exam CRUD Operations**:
  - `POST /exams` -> Instantiate an Exam draft.
  - `PUT /exams/:id` -> Update dynamic constraints of the draft.
  - `POST /exams/:id/submit` -> Move the Draft constraint flag to submitted processing.
  - `POST /exams/:id/resubmit` -> Resend a Rejected bill.
  - `GET /exams/:id/bill` -> Retrieve numeric breakdown of earnings.
- **Resource Management**:
  - `POST /exams/:id/staff` -> Embed a supporting member.
  - `GET /staff-rates` -> Reference dictionary query.
- **External Handshakes**:
  - `POST /exams/:id/external-link` -> Mint external token tracking schema.

### D. Billing & Accountant Operations (`/api/accountant`)
Authorized specifically for the `BILLING_INCHARGE` role.
- **Verification & Settlement**:
  - `GET /claims` & `GET /claims/:id` -> View approved bills ready for fulfillment.
  - `POST /claims/:id/approve` -> Final audit clearance.
  - `POST /claims/:id/reject` -> Return to admin/faculty due to discrepancy.
  - `POST /claims/:id/pay` -> Officially transitions `APPROVED` -> `PAID` mapping the UTR reference.
  - `PUT /claims/:id/allowances` -> Explicit manual adjustments to Convienience allowances.
- **Faculty Reference**:
  - `GET /faculty` & `GET /faculty/:id` -> Reference sensitive bank information.
  - `GET /payments` -> Aggregate ledger logs.

### E. Course Coordinator Operations (`/api/coordinator`)
Allows faculty leads to cross-check claim validity before they reach Admin level.
- `POST /assign` -> Assign faculty as subject coordinator.
- `GET /claims` -> Fetch claims requiring Coordinator's sign-off.
- `POST /verify` & `POST /reject` & `POST /submit-billing` -> Actions pushing the claim status hierarchy.

### F. Ticketing & Queries (`/api/queries`)
- `POST /queries` -> Faculty opens a support dispute regarding rates/rejection.
- `GET /queries` -> List available tickets.
- `POST /queries/:id/respond` -> Admin/Accounts append comments to the query.
- `PATCH /queries/:id/status` -> Close/Open ticket states.

### G. Document Generation (`/api/pdf`)
- `GET /claim/:examId/download` -> Emits the Teaching Remuneration PDF slip (generated via Puppeteer matching `template.html`).
- `GET /non-teaching/:examId/download` -> Emits the distinct Non-Teaching PDF format.

---

## 5. Security & Environment Architecture

### Storage & Secrets
The system leverages `.env` configurations extensively to toggle environments smoothly between Development and Production without hardcoding secrets:
- `JWT_SECRET`: Used to cryptographically sign the JSON Web Tokens emitted upon successful initial authentication.
- `DB_PASSWORD` & `DB_PORT`: Postgres connection strings isolating DB credentials from the source code.
- `GOOGLE_CLIENT_ID`: Secures the OAuth workflow verifying that external login tokens belong exclusively to this application.

### Request Lifecycles & Middlewares
- **Authentication Gateway (`authMiddleware.js`)**: Examines the `Authorization: Bearer <token>` header on every protected request. Validates expiration and signature integrity before appending the decrypted `req.user` payload to the request lifecycle.
- **Authorization Filters (`roleMiddleware.js`)**: Restricts routes depending on the decoded `req.user.role`. For example, `/api/accountant` immediately rejects calls where `role` is not `BILLING_INCHARGE`, returning HTTP 403 Forbidden.
- **Data Integrity (`validationMiddleware.js`)**: Employs `express-validator` to ensure that JSON payloads contain valid string formats, email sanitization, and positive numeric validations before allowing controllers to process calculations.
- **Rate Limiting**: Protects brute-force vulnerable endpoints (like `/login` or `/generate-link`) by restricting IP requests.

---

## 6. Frontend State Management & Routing

### React Router Architecture
- **Protected Routes Layout**: The frontend wraps components mapped to `/faculty/*`, `/admin/*`, and `/accountant/*` inside a higher-order `<ProtectedRoute>` component. If the global auth context fails to verify a locally stored Token, the React Router dynamically yields to a `<Navigate to="/login" replace />` hook.
- **Global Auth Context**: Utilizes React's `useContext` hook to propagate `user` payload states across all deeply nested components (like Navbars and Sidebars).

### Data Access Architecture
- **Axios Interceptors**: The generic `api` instance attaches a universal request interceptor. This checks the browser's `localStorage` for a JWT and injects it into the HTTP header natively, removing the need to manually append tokens across the 50+ diverse API calls.
- **Status Mapping Hooks**: State constants (e.g., `DRAFT`, `PENDING`, `APPROVED`, `PAID`) dynamically map to Tailwind CSS color constants (`text-orange-600` for Pending, `text-green-600` for Paid) for seamless visual queues via custom UI slot components.

---

## 7. Complex Business Logic & Mathematical Calculations

The cornerstone of the application lies entirely within Postgres functions natively invoking math over huge datasets cleanly. The backend relies heavily on the `calculate_exam(p_exam_id integer)` PostgreSQL function rather than calculating via Express.

### Calculation Breakdown (Teaching Claims)
*When Exam form type is `TEACHING_INTERNAL` or `TEACHING_EXTERNAL`:*
1. Matches `students_count` strictly against standard `batch_sizes`.
   *(Calculation: `batches = CEIL(students / allowed_batch_size)`)*
2. Injects the relevant rate variable depending on `exam_type` (Oral vs Practical vs Paper Setting) and `academic_year`.
3. Validates against the Institutional Minima rule: If `students * rate < min_per_day`, it automatically bounds to the `min_per_day` value and flags the result with `min_applied = TRUE`.
4. Deducts 10% Flat TDS across the Gross (`tds_amount = gross * 0.10`) yielding `net_amount`.

### Calculation Breakdown (Non-Teaching Claims)
1. Ignores raw student counts for primary earnings but uses them to establish *Batch Count maximums*.
2. For each assigned supporting staff array object (`exam_staff_members`); calculates:
   `Wage = (Prep Rate * Prep Days) + (Batch Rate * Batches * Exam Days) + (Clean Rate * Clean Days)`.
3. **Exception Clause**: If the staff array flags the role as `"Expert Assistant"` (which binds to internal Faculty only), they are mathematically stripped from `Preparation Days` and `Cleaning Days` capabilities, earning sheerly through multiplication with [(Batch Rate * Batches)](file:///d:/Bill/exam-remuneration-system/backend/src/controllers/admin.controller.js#748-785).
