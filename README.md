# 📘 ERMS — Exam Remuneration Management System  
_An automated system based on PCCOE Remuneration Booklet v2.1_

## 📌 Overview
The **Exam Remuneration Management System (ERMS)** is a full-stack application built for PCCOE to automate the calculation, verification, approval, and disbursal of exam remuneration.  
It digitizes the entire flow as per: **PCCOE Exam Remuneration Booklet v2.1**

## ✨ Major Features
### Faculty
- Create exam remuneration claims  
- Add exam details (PR/OR/TW/Project/Seminar)  
- Add support staff  
- Automated calculation based on official norms  
- Download claim PDF  
- Raise and track queries  
- View real-time claim status  

### Admin
- View submitted claims  
- Validate, approve, or reject claims  
- Enforce backlog / regular rules  
- Respond to faculty queries  
- Forward claims to Finance  

### Accountant
- View approved claims  
- Add payment details (UTR, Mode, Amount)  
- Mark as PAID  
- Generate reports (CSV/Excel/PDF)  
- Finance query handling  

### System
- Auto calculation using PCCOE rules  
- PDF generation  
- Stored Procedure (proc) calculation mode  
- Audit logs  
- Query management  

---

## 🔐 User Roles & Workflow
### Roles:
- **Faculty**
- **Admin (Exam Cell)**
- **Accountant (Finance Department)**

### Claim Status Lifecycle
```
DRAFT → SUBMITTED → VERIFIED → APPROVED → PAID
```

---

## 🧮 Automated Calculation Engine
- Batch size computation  
- Examiner remuneration based on FY/SY/TY/Final  
- Minimum ₹500/day rule  
- Support staff remuneration  
- Backlog rule automation  
- Stored procedure engine for fast computation  

---

## 📨 Query Management System (QMS)
A complete grievance and clarification system.

### Query Flow:
```
OPEN → IN_REVIEW → RESOLVED → REOPENED → FINAL_CLOSED
```

### Features:
- Faculty can raise queries  
- Admin / Accountant can respond  
- Thread-style conversation  
- Linked directly to specific exam claims  
- Fully auditable  

Database tables:  
`queries`, `query_responses`

---

## 🖨️ PDF System
- Uses official PCCOE remuneration form  
- In-app PDF viewer  
- Print + download  
- Backend endpoint: `/pdf/claim/:examId`  
- Future: Dynamic PDF generation with placeholders  

---

## 🗂️ Database Schema (PostgreSQL)
### Master Tables
- remuneration_rates  
- batch_sizes  
- staff_role_rates  
- exam_staff_norms_regular  
- exam_staff_norms_backlog  

### Transaction Tables  
- users  
- exams  
- exam_staff  
- remuneration_calculations  
- approvals  
- payments  
- audit_logs  
- queries  
- query_responses  

### Signup Restriction
Only emails ending with:
```
@pccoe.pune.org
```
can register as faculty.

Admin + Accountant are seeded manually.

---

## 🧱 Backend Architecture (Node.js + Express)
```
backend/
 ├── src/
 │    ├── controllers/
 │    ├── routes/
 │    ├── services/
 │    ├── middleware/
 │    ├── db.js
 │    └── app.js
 ├── scripts/
 │    └── createDefaultUsers.js
 ├── migrations/
 └── server.js
```

### Key Modules:
- JWT Authentication  
- Hashing (bcrypt)  
- Exam CRUD  
- Staff CRUD  
- Calculation Engine  
- Stored Procedure Runner  
- PDF Router  
- Query Router  
- Approvals Router  
- Payments Router  
- Audit Logs  

---

## 🧱 Frontend Architecture (React + Vite)
```
src/
 ├── api/
 ├── components/
 │    ├── layout/ (Sidebar, Topbar, PageWrapper)
 │    ├── pdf/
 ├── context/
 ├── hooks/
 ├── pages/
 │    ├── Auth/
 │    ├── Faculty/
 │    ├── Admin/
 │    └── Accountant/
 └── assets/
```

### UI Highlights:
- Sidebar with hover-expand  
- Fixed Topbar  
- PageWrapper for unified layout  
- Professional dashboard UI  
- Dynamic routing with role enforcement  
- PDF Viewer and Print  
- Clean Claim Form  
- Staff addition & calculation triggering  

---

## 📦 Installation

### 1️⃣ Backend
```sh
cd backend
npm install
```

Create `.env`:
```
DATABASE_URL=postgres://user:pass@localhost:5432/erms
JWT_SECRET=supersecret
PORT=4000
```

Run migrations:
```sh
npm run migrate
```

Seed Admin & Accountant:
```sh
node scripts/createDefaultUsers.js
```

Start server:
```sh
npm run dev
```

---

### 2️⃣ Frontend
```sh
cd frontend
npm install
```

Create `.env`:
```
VITE_API_BASE=http://localhost:4000
```

Start frontend:
```sh
npm run dev
```

---

## 🧪 API Overview (Summary)

### Auth
```
POST /auth/login
POST /auth/signup
```

### Exams
```
POST /exams
GET /exams
GET /exams/:id
PUT /exams/:id/status
```

### Staff
```
POST /staff/:id
GET /staff/:id
```

### Calculation
```
POST /calculate/:id?mode=app
POST /calculate/:id?mode=proc
```

### Queries
```
POST /queries
GET /queries/:examId
POST /queries/:id/respond
PUT /queries/:id/status
```

### Admin
```
POST /approvals
GET /approvals/exam/:id
```

### Finance
```
POST /payments
GET /payments
```

### PDF
```
GET /pdf/claim/:examId
```

---

## 📈 Reports
- Exam-wise  
- Department-wise  
- Finance summary  
- CSV export  

---

## 🛡 Security
- JWT Auth  
- Password hashing  
- Role-based protection  
- Protected API routes  
- Email domain restrictions  
- SQL injection safe  

---

## 🚀 Deployment
### Backend:
- Render / Railway / Supabase Functions / VPS  

### Frontend:
- Vercel / Netlify / Firebase Hosting  

### Database:
- Supabase / Neon / Railway / ElephantSQL  

---

## 🏁 Conclusion
ERMS is a **complete, production-ready examination remuneration automation system** based on PCCOE norms.

It ensures:
- Zero manual calculation errors  
- Faster processing  
- Transparent audit trails  
- Automated PDF + reporting  
- Smooth workflows for Faculty, Admin, and Accountant  



---

# 🗄️ Detailed SQL Database Schema (Complete)

This section documents the complete SQL database design for ERMS (Exam Remuneration Management System). It includes:

1. Table definitions (columns, types, constraints)
2. Primary and foreign keys
3. Relationships (one-to-one, one-to-many, many-to-many)
4. Indexes and constraints for performance and integrity
5. Triggers and stored procedure outlines for automated calculation and audit logging

> The schema below assumes **PostgreSQL** as the RDBMS. Data types and DDL use PostgreSQL syntax.

---

## 1. Overview of Entities

Primary entities in ERMS:

- `users` — authentication and role data
- `remuneration_rates` — master rates per exam type / program
- `batch_sizes` — program-specific batch sizes for different exam types
- `staff_role_rates` — per-role rates (prep, per_batch, cleaning)
- `exams` — exam claims created by faculty
- `exam_staff` — support staff entries linked to an exam
- `remuneration_calculations` — calculation results (can be persisted)
- `approvals` — admin approval records
- `payments` — payment records handled by accountant
- `audit_logs` — audit trail of changes/actions
- `queries` — query management (QMS)
- `query_responses` — threaded responses on queries

We also include auxiliary master tables for backlog vs regular norms if needed:
- `exam_staff_norms_regular`
- `exam_staff_norms_backlog`

---

## 2. Table Definitions (DDL-style)

Below are the `CREATE TABLE` definitions with columns, types, constraints, and comments.

> Note: adapt `VARCHAR` sizes and numeric precisions to your needs.

### 2.1 `users`
```sql
CREATE TABLE users (
  id               SERIAL PRIMARY KEY,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  password_hash    TEXT NOT NULL,
  role             TEXT NOT NULL CHECK (role IN ('faculty','admin','accountant')),
  department       TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```
- `email` is unique.
- `role` constrained to valid values.
- Index on `email` automatically created by UNIQUE.

### 2.2 `remuneration_rates` (Master rates per exam type / program)
```sql
CREATE TABLE remuneration_rates (
  id                        SERIAL PRIMARY KEY,
  exam_type                 TEXT NOT NULL, -- e.g., 'PR','OR','TW','PROJECT'
  fy_sy_btech_rate          NUMERIC(10,2),
  ty_final_btech_rate       NUMERIC(10,2),
  vocational_mtech_mca_rate NUMERIC(10,2),
  min_remuneration_per_day  NUMERIC(10,2) NOT NULL DEFAULT 500,
  created_at                TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (exam_type)
);
```

### 2.3 `batch_sizes` (Master)
```sql
CREATE TABLE batch_sizes (
  id            SERIAL PRIMARY KEY,
  program       TEXT NOT NULL, -- e.g., 'B.Tech','B.Voc','M.Tech'
  practical     INTEGER,
  oral          INTEGER,
  term_work     INTEGER,
  project_oral  INTEGER,
  dissertation_project_2 INTEGER
);
CREATE UNIQUE INDEX idx_batch_sizes_program ON batch_sizes(program);
```

### 2.4 `staff_role_rates` (Master)
```sql
CREATE TABLE staff_role_rates (
  id               SERIAL PRIMARY KEY,
  staff_role       TEXT NOT NULL, -- 'Expert Assistant','Lab Assistant','Foreman','Peon'
  preparation_rate NUMERIC(10,2) DEFAULT 0,
  per_batch_rate   NUMERIC(10,2) DEFAULT 0,
  cleaning_rate    NUMERIC(10,2) DEFAULT 0,
  UNIQUE (staff_role)
);
```

### 2.5 `exam_staff_norms_regular` and `exam_staff_norms_backlog` (optional master tables)
```sql
CREATE TABLE exam_staff_norms_regular (
  id SERIAL PRIMARY KEY,
  program TEXT NOT NULL,
  staff_role TEXT NOT NULL,
  min_count INTEGER DEFAULT 0,
  max_count INTEGER DEFAULT 100
);

CREATE TABLE exam_staff_norms_backlog (
  id SERIAL PRIMARY KEY,
  program TEXT NOT NULL,
  staff_role TEXT NOT NULL,
  min_count INTEGER DEFAULT 0,
  max_count INTEGER DEFAULT 100
);
```

### 2.6 `exams` (main transaction)
```sql
CREATE TABLE exams (
  id               SERIAL PRIMARY KEY,
  faculty_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_type        TEXT NOT NULL,
  program          TEXT,
  level            TEXT, -- FY/SY/TY/Final/Other
  subject_name     TEXT NOT NULL,
  subject_code     TEXT,
  num_students     INTEGER NOT NULL DEFAULT 0,
  exam_date        DATE,
  is_backlog       BOOLEAN DEFAULT FALSE,
  status           TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SUBMITTED','VERIFIED','APPROVED','PAID','REJECTED')),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_exams_faculty_id ON exams(faculty_id);
CREATE INDEX idx_exams_status ON exams(status);
```

### 2.7 `exam_staff` (support staff entries for each exam)
```sql
CREATE TABLE exam_staff (
  id               SERIAL PRIMARY KEY,
  exam_id          INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  staff_role       TEXT NOT NULL,
  count            INTEGER NOT NULL DEFAULT 1,
  preparation_days INTEGER NOT NULL DEFAULT 0,
  cleaning_days    INTEGER NOT NULL DEFAULT 0,
  batches          INTEGER, -- computed or stored
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (exam_id, staff_role)
);
CREATE INDEX idx_exam_staff_exam_id ON exam_staff(exam_id);
```

### 2.8 `remuneration_calculations` (persisted calculation results)
```sql
CREATE TABLE remuneration_calculations (
  id                    SERIAL PRIMARY KEY,
  exam_id               INTEGER UNIQUE REFERENCES exams(id) ON DELETE CASCADE,
  calculated_at         TIMESTAMP WITH TIME ZONE DEFAULT now(),
  examiner_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  staff_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount          NUMERIC(14,2) NOT NULL DEFAULT 0,
  min_applied           BOOLEAN DEFAULT FALSE,
  details_json          JSONB, -- stores detailed breakdown, per-role amounts, batches etc.
  mode                  TEXT CHECK (mode IN ('app','proc')) DEFAULT 'app'
);
CREATE INDEX idx_rem_calc_exam_id ON remuneration_calculations(exam_id);
```

### 2.9 `approvals` (Admin verification & approval)
```sql
CREATE TABLE approvals (
  id            SERIAL PRIMARY KEY,
  exam_id       INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  admin_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL CHECK (action IN ('verified','approved','rejected')),
  comments      TEXT,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_approvals_exam_id ON approvals(exam_id);
```

### 2.10 `payments`
```sql
CREATE TABLE payments (
  id              SERIAL PRIMARY KEY,
  exam_id         INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  remuneration_id INTEGER REFERENCES remuneration_calculations(id) ON DELETE SET NULL,
  accountant_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  amount          NUMERIC(14,2) NOT NULL,
  transaction_ref TEXT,
  status          TEXT NOT NULL CHECK (status IN ('PENDING','PAID','FAILED')) DEFAULT 'PENDING',
  payment_date    TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_payments_exam_id ON payments(exam_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 2.11 `audit_logs`
```sql
CREATE TABLE audit_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   INTEGER,
  meta        JSONB,
  timestamp   TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
```

### 2.12 `queries`
```sql
CREATE TABLE queries (
  id          SERIAL PRIMARY KEY,
  exam_id     INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  role        TEXT CHECK (role IN ('faculty','admin','accountant')),
  title       TEXT NOT NULL,
  message     TEXT,
  status      TEXT NOT NULL CHECK (status IN ('OPEN','IN_REVIEW','RESOLVED','REOPENED','FINAL_CLOSED')) DEFAULT 'OPEN',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_queries_exam_id ON queries(exam_id);
CREATE INDEX idx_queries_status ON queries(status);
```

### 2.13 `query_responses`
```sql
CREATE TABLE query_responses (
  id           SERIAL PRIMARY KEY,
  query_id     INTEGER NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
  responder_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  role         TEXT CHECK (role IN ('faculty','admin','accountant')),
  message      TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_query_responses_query_id ON query_responses(query_id);
```

---

## 3. Relationships and Cardinality

### 3.1 `users` → `exams`  
- **One-to-Many**: A single faculty (user) can create many `exams`.  
- Implemented via `exams.faculty_id` referencing `users.id`.

### 3.2 `exams` → `exam_staff`  
- **One-to-Many**: One exam claim can have multiple staff rows.  
- Implemented via `exam_staff.exam_id` referencing `exams.id`.

### 3.3 `exams` → `remuneration_calculations`  
- **One-to-One (logical)**: Each exam typically has one latest calculation result persisted.  
- Implemented via `remuneration_calculations.exam_id` unique FK.

### 3.4 `exams` → `approvals`  
- **One-to-Many**: Multiple approval actions (verify/approve/reject) over time.  
- Implemented via `approvals.exam_id`.

### 3.5 `remuneration_calculations` → `payments`  
- **One-to-Many**: One calculation may lead to multiple payment attempts/entries.  
- Implemented via `payments.remuneration_id` (nullable).

### 3.6 `exams` → `queries` → `query_responses`  
- **One-to-Many**: Exams have many queries; queries have many responses (threaded).

---

## 4. Indexes, Constraints & Performance Tips

### Indexes (recommended)
- `users.email` — UNIQUE index (faster login lookup).  
- `idx_exams_faculty_id` — filter by faculty quickly.  
- `idx_exams_status` — fast retrieval by status for admin queues.  
- `idx_exam_staff_exam_id` — join performance on staff rows.  
- `idx_rem_calc_exam_id` — quick lookup for cached calculations.  
- `idx_payments_status` — pending payments query.  
- `idx_queries_status` — open queries dashboard.  
- `idx_audit_logs_table` — audit queries by table.

### Constraints & Checks
- `users.role` CHECK to ensure valid roles.
- `exams.status` CHECK for allowed statuses.
- `payments.status` CHECK for valid states.
- `remuneration_calculations.mode` CHECK ('app'|'proc').

### Foreign Key Policies
- Use `ON DELETE CASCADE` on child rows that should be removed when parent is deleted (e.g., `exams` → `exam_staff`).
- Use `ON DELETE SET NULL` for user references that should remain (e.g., `audits.user_id`, `approvals.admin_id`) to preserve history while allowing user removal.

### Computed columns & materialized views
- You can create a materialized view `mv_exam_financials` that aggregates totals (examiner_amount, staff_amount, total_amount) for quick reporting dashboards.
- Regularly refresh the materialized view after batch calculations or use triggers to keep it updated.

---

## 5. Triggers & Audit Logging

### 5.1 Audit Trigger (example)
Create a trigger function that inserts into `audit_logs` on INSERT/UPDATE/DELETE for important tables:

```sql
CREATE OR REPLACE FUNCTION audit_if_needed() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, meta, timestamp)
  VALUES (current_setting('erms.current_user_id', true)::INTEGER, TG_OP, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), row_to_json(COALESCE(NEW, OLD)), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Attach trigger to tables:
```sql
CREATE TRIGGER trg_audit_exams AFTER INSERT OR UPDATE OR DELETE ON exams
  FOR EACH ROW EXECUTE FUNCTION audit_if_needed();
```

> Note: Set `erms.current_user_id` in the DB session (from backend) before performing modifications:
```sql
SELECT set_config('erms.current_user_id', '123', true);
```

This keeps a stable, auditable trail.

---

## 6. Stored Procedure: Calculation (Outline)

A recommended stored procedure `calculate_exam_remuneration(_exam_id int, _mode text)`:

**Purpose**: compute examiner amount, staff amount and total according to master rates and norms. When `_mode = 'proc'` the calculation runs entirely inside the DB.

Simplified signature:
```sql
CREATE OR REPLACE FUNCTION calculate_exam_remuneration(_exam_id INT, _mode TEXT DEFAULT 'app')
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_exam RECORD;
  v_batches INTEGER;
  v_examiner_amt NUMERIC := 0;
  v_staff_amt NUMERIC := 0;
BEGIN
  SELECT * INTO v_exam FROM exams WHERE id = _exam_id;

  -- compute batches using batch_sizes table (example)
  SELECT ceil(v_exam.num_students::NUMERIC / bs.practical) INTO v_batches
    FROM batch_sizes bs WHERE bs.program = v_exam.program;

  -- compute examiner_amt from remuneration_rates table
  -- apply minimum per day rule

  -- compute staff amounts by summing staff_role_rates * counts/batches

  -- upsert into remuneration_calculations
  INSERT INTO remuneration_calculations (exam_id, calculated_at, examiner_amount, staff_amount, total_amount, details_json, mode)
  VALUES (_exam_id, now(), v_examiner_amt, v_staff_amt, v_examiner_amt + v_staff_amt, '{}'::jsonb, _mode)
  ON CONFLICT (exam_id) DO UPDATE
    SET calculated_at = now(), examiner_amount = EXCLUDED.examiner_amount, staff_amount = EXCLUDED.staff_amount, total_amount = EXCLUDED.total_amount, details_json = EXCLUDED.details_json, mode = EXCLUDED.mode;

END;
$$;
```

This function can be optimized further and include granular details in `details_json` (per-role breakdown, batch counts, rates used).

---

## 7. Example Queries

- Get pending approvals for admin:
```sql
SELECT * FROM exams WHERE status = 'SUBMITTED' ORDER BY created_at DESC;
```

- Get faculty's exams and calculation:
```sql
SELECT e.*, rc.examiner_amount, rc.staff_amount, rc.total_amount
FROM exams e LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id
WHERE e.faculty_id = $1;
```

- Get open queries:
```sql
SELECT q.*, u.full_name FROM queries q JOIN users u ON u.id = q.user_id WHERE q.status = 'OPEN' ORDER BY q.created_at;
```

---

## 8. Migration & Seed Suggestions

- Maintain SQL migration files (using a migration tool like `node-pg-migrate`, `knex`, or `flyway`).
- Provide seed script for master tables (`remuneration_rates`, `batch_sizes`, `staff_role_rates`) based on PCCOE booklet values.
- Provide seed script for default users (admin / accountant).

---

## 9. Backup & Maintenance Recommendations

- Regularly back up PostgreSQL (daily snapshots, weekly full backups).
- Create retention policy for `audit_logs` (archive older than X years).
- Use connection pooling and set proper `max_connections`.
- Monitor slow queries and add indexes as needed.

---

## 10. Final Notes on Database Security

- Use parameterized queries (pg library already does).
- Restrict DB user privileges (separate read-only reporting user).
- Enable TLS for DB connections in production.
- Rotate credentials and secrets regularly.

---

