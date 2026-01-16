# Accountant Workflow - Database Schema Verification

## ✅ Database Schema Check (from backup.sql)

### Core Tables Status

#### 1. **users** ✅
- Columns: `id`, `name`, `email`, `password`, `role`, `department`, `is_active`, `created_at`
- Role check: `FACULTY`, `ACCOUNTANT`, `ADMIN`
- **Status**: Schema correct
- **Note**: Column is `name`, NOT `full_name` (fixed in controller)

#### 2. **exams** ✅
- Columns: `id`, `faculty_id`, `exam_type`, `program`, `level`, `students_count`, `subject_name`, `subject_code`, `semester`, `academic_year`, `exam_date`, `is_backlog`, `status`, `claim_form_type`, `external_examiner_id`, `conveyance_amount`
- Status values: `draft`, `submitted`, `paid` (no constraint, VARCHAR)
- Claim types: `TEACHING_INTERNAL`, `TEACHING_EXTERNAL`, `NON_TEACHING`
- **Status**: Schema correct

#### 3. **remuneration_calculations** ✅
- Columns: `id`, `exam_id`, `examiner_amount`, `staff_amount`, `chairman_allowance`, `conveyance_amount`, `total_amount`, `min_applied`, `tds_amount`, `net_amount`
- **Status**: Schema correct
- **Key Field**: `net_amount` (used for payment processing)

#### 4. **faculty_bank_accounts** ✅
- Columns: `id`, `faculty_id`, `account_holder_name`, `bank_name`, `branch_name`, `account_number`, `ifsc_code`, `pan_number`, `pan_document_url`, `cancelled_cheque_url`, `is_verified`, `is_active`
- **Status**: Schema correct

#### 5. **external_examiners** ✅
- Columns: `id`, `full_name`, `email`, `mobile`, `parent_institute`, `pan_number`, `bank_name`, `branch_name`, `account_number`, `ifsc_code`, `pan_document_url`, `cancelled_cheque_url`
- **Plus Travel Fields** (from migration): `is_local`, `journey_days`, `travel_allowance`, `travel_proof_url`
- **Status**: Schema correct

#### 6. **exam_staff_members** ✅ (from migration)
- Columns: `id`, `exam_id`, `staff_name`, `staff_role`, `preparation_days`, `examination_days`, `cleaning_days`, `batches`
- **Status**: Created via migration

#### 7. **payments** ⚠️ (NEW - needs migration)
- **Status**: Migration file created but NOT YET RUN
- **File**: `database/migrations/create_payments_table.sql`
- **Columns**: `id`, `exam_id`, `amount`, `payment_method`, `reference_number`, `payment_date`, `accountant_id`, `notes`

## 🔄 Complete Accountant Workflow

### Phase 1: Faculty Submits Claim
```sql
-- Faculty creates exam
INSERT INTO exams (faculty_id, claim_form_type, exam_type, ..., status)
VALUES (1, 'TEACHING_INTERNAL', 'PR', ..., 'draft');

-- Faculty submits
UPDATE exams SET status = 'submitted' WHERE id = X;

-- System calculates remuneration
SELECT calculate_exam(X);
-- This populates remuneration_calculations table
```

### Phase 2: Accountant Views Claims
```sql
-- Dashboard stats
SELECT
  COUNT(*) FILTER (WHERE status = 'submitted') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'paid') AS paid_count,
  SUM(rc.net_amount) FILTER (WHERE e.status = 'submitted') AS pending_amount,
  SUM(rc.net_amount) FILTER (WHERE e.status = 'paid') AS paid_amount
FROM exams e
LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id
WHERE e.status IN ('submitted', 'paid');

-- List submitted claims
SELECT
  e.id,
  e.claim_form_type,
  e.exam_type,
  e.subject_name,
  e.status,
  u.name AS faculty_name,
  rc.total_amount,
  rc.net_amount
FROM exams e
JOIN users u ON e.faculty_id = u.id
LEFT JOIN remuneration_calculations rc ON e.id = rc.exam_id
WHERE e.status = 'submitted'
ORDER BY e.updated_at DESC;
```

### Phase 3: Accountant Views Claim Details
```sql
-- Get full claim details
SELECT
  e.*,
  u.name AS faculty_name,
  u.email AS faculty_email,
  fb.bank_name AS faculty_bank_name,
  fb.account_number AS faculty_account_number,
  fb.ifsc_code AS faculty_ifsc_code,
  fb.pan_number AS faculty_pan_number,
  fb.pan_document_url AS faculty_pan_url,
  fb.cancelled_cheque_url AS faculty_cheque_url,
  ee.full_name AS external_examiner_name,
  ee.bank_name AS external_bank_name,
  ee.account_number AS external_account_number,
  ee.travel_allowance,
  ee.travel_proof_url
FROM exams e
JOIN users u ON u.id = e.faculty_id
LEFT JOIN faculty_bank_accounts fb ON u.id = fb.faculty_id
LEFT JOIN external_examiners ee ON e.external_examiner_id = ee.id
WHERE e.id = X;

-- Get calculation
SELECT * FROM remuneration_calculations WHERE exam_id = X;

-- Get staff (for non-teaching)
SELECT * FROM exam_staff_members WHERE exam_id = X;
```

### Phase 4: Accountant Verifies
**Verification Checklist**:
- ✅ Bank details present (account_number, ifsc_code)
- ✅ PAN number present
- ✅ Documents uploaded (pan_document_url, cancelled_cheque_url)
- ✅ Calculation exists (net_amount > 0)
- ✅ For External: Travel proof uploaded (if > 25km)

### Phase 5: Accountant Processes Payment
```sql
BEGIN;

-- Insert payment record
INSERT INTO payments (
  exam_id,
  amount,
  payment_method,
  reference_number,
  payment_date,
  accountant_id,
  notes
)
VALUES (X, 5400.00, 'NEFT', 'UTR123456', '2026-01-15', 2, NULL);

-- Update exam status
UPDATE exams SET status = 'paid', updated_at = NOW() WHERE id = X;

COMMIT;
```

### Phase 6: Claim is Locked
- Status = 'paid'
- Cannot be edited
- Cannot be recalculated
- Payment record is immutable

## 🚨 Critical Issues to Fix

### 1. **Run Payments Table Migration** (CRITICAL)
```bash
psql -U postgres -d ERMS -f database/migrations/create_payments_table.sql
```
**Without this, payment processing will fail!**

### 2. **Verify Status Values**
The `exams.status` field is VARCHAR without strict constraints. Valid values should be:
- `draft`
- `submitted`
- `paid`

Consider adding a CHECK constraint:
```sql
ALTER TABLE exams
ADD CONSTRAINT exams_status_check
CHECK (status IN ('draft', 'submitted', 'paid', 'rejected'));
```

### 3. **Missing Columns Check**
Run these queries to verify all columns exist:
```sql
-- Check users table
\d users

-- Check faculty_bank_accounts
\d faculty_bank_accounts

-- Check external_examiners (should have travel fields)
\d external_examiners

-- Check exam_staff_members (should exist)
\d exam_staff_members

-- Check payments (should exist after migration)
\d payments
```

## 📊 Testing Queries

### Test 1: Check if faculty has bank details
```sql
SELECT
  u.id,
  u.name,
  fb.bank_name,
  fb.account_number,
  fb.pan_number
FROM users u
LEFT JOIN faculty_bank_accounts fb ON u.id = fb.faculty_id
WHERE u.role = 'FACULTY';
```

### Test 2: Check submitted claims ready for payment
```sql
SELECT
  e.id,
  e.subject_name,
  e.status,
  rc.net_amount,
  fb.account_number IS NOT NULL AS has_bank_details,
  fb.pan_number IS NOT NULL AS has_pan
FROM exams e
JOIN users u ON e.faculty_id = u.id
LEFT JOIN remuneration_calculations rc ON e.id = rc.exam_id
LEFT JOIN faculty_bank_accounts fb ON u.id = fb.faculty_id
WHERE e.status = 'submitted';
```

### Test 3: Check external examiner travel allowances
```sql
SELECT
  e.id,
  e.subject_name,
  ee.full_name,
  ee.is_local,
  ee.journey_days,
  ee.travel_allowance,
  ee.travel_proof_url
FROM exams e
JOIN external_examiners ee ON e.external_examiner_id = ee.id
WHERE e.claim_form_type = 'TEACHING_EXTERNAL'
  AND e.status = 'submitted';
```

## ✅ Backend API Endpoints Status

All endpoints are implemented in `backend/src/controllers/accountant.controller.js`:

- ✅ `GET /accountant/dashboard` - Dashboard stats
- ✅ `GET /accountant/claims` - List claims (with status filter)
- ✅ `GET /accountant/claims/:id` - Get claim details
- ✅ `POST /accountant/claims/:id/pay` - Process payment
- ✅ `GET /accountant/faculty` - List faculty
- ✅ `GET /accountant/faculty/:id` - Faculty details

**Fixed Issues**:
- ✅ Changed `u.full_name` to `u.name`
- ✅ Changed `faculty_bank` to `faculty_bank_accounts`
- ✅ Updated to use `net_amount` instead of `total_amount`
- ✅ Removed approve/reject workflow

## 🎯 Next Steps

1. **RUN MIGRATION**: `create_payments_table.sql`
2. **Verify all migrations ran**: Check exam_staff_members, exam_staff_norms, external_examiners travel columns
3. **Test accountant login**: Verify role-based access
4. **Test complete flow**: Submit claim → View as accountant → Process payment
5. **Update frontend**: Enhance BillView.jsx to show all details
