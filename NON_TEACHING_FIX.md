# NON-TEACHING Claims - Examiner Amount Fix

## Summary
Updated the system to ensure NON-TEACHING claims have `examiner_amount = 0` in the database and all UI panels.

## Changes Made

### 1. Frontend - Removed Staff Allocation Card
**File:** `frontend/src/pages/accountant/BillView.jsx`
- ✅ Removed the "Staff Allocation" card from the right sidebar (the one shown in your image)
- This card was redundant since staff details are already shown in the main table

### 2. Database Function Update
**File:** `update_function.sql` (created)
- ✅ Updated `calculate_exam()` function to check `claim_form_type`
- ✅ For `NON_TEACHING` claims: `v_examiner = 0` and `v_min = FALSE`
- ✅ For `TEACHING_INTERNAL` and `TEACHING_EXTERNAL`: Normal calculation applies
- ✅ Preserves `chairman_allowance` and `conveyance_amount` set by Billing Incharge

### 3. Schema Already Correct
**File:** `schema.sql`
- ✅ Already has the correct logic (lines 58-104)
- ✅ Sets examiner_amount = 0 for NON_TEACHING claims

## How to Apply Database Changes

### Option 1: Using pgAdmin
1. Open pgAdmin
2. Connect to **ERMS** database
3. Open Query Tool
4. Copy and paste the contents of `update_function.sql`
5. Click Execute (F5)

### Option 2: Using psql Command Line
```bash
psql -U postgres -d ERMS -f update_function.sql
```
(Enter your postgres password when prompted)

### Option 3: Manual Execution
```sql
-- Connect to ERMS database first
\c ERMS

-- Then run the update_function.sql content
```

## Verification

After running the SQL update, verify with:

```sql
-- Check a NON_TEACHING claim
SELECT 
  e.id,
  e.claim_form_type,
  rc.examiner_amount,
  rc.staff_amount,
  rc.total_amount
FROM exams e
JOIN remuneration_calculations rc ON rc.exam_id = e.id
WHERE e.claim_form_type = 'NON_TEACHING'
LIMIT 5;
```

**Expected Result:**
- `examiner_amount` should be `0.00` for all NON_TEACHING claims
- `staff_amount` should have the calculated value
- `total_amount` = `staff_amount` + `chairman_allowance` + `conveyance_amount`

## UI Behavior

### Bill Summary Component
The `BillSummary.jsx` component already handles this correctly:
- Shows "Calculated Examiner Amount" only when `examiner_amount_calculated > 0`
- For NON_TEACHING claims, this section won't display
- Only shows Staff Amount, Chairman Allowance, and Conveyance Amount

### All Panels
- ✅ Faculty Dashboard: Will show 0 for examiner amount on NON_TEACHING
- ✅ Accountant View: Will show 0 for examiner amount on NON_TEACHING
- ✅ Admin View: Will show 0 for examiner amount on NON_TEACHING
- ✅ PDF Generation: Will show 0 for examiner amount on NON_TEACHING

## Files Modified

1. ✅ `frontend/src/pages/accountant/BillView.jsx` - Removed Staff Allocation card
2. ✅ `update_function.sql` - Created SQL update script
3. ✅ `database/migrations/update_calculate_exam_non_teaching.sql` - Migration file

## Testing Checklist

- [ ] Run `update_function.sql` on ERMS database
- [ ] Create a new NON_TEACHING claim
- [ ] Verify examiner_amount = 0 in database
- [ ] Check Bill Summary shows only staff amounts
- [ ] Verify Billing Incharge can still update allowances
- [ ] Confirm total calculation is correct
- [ ] Test PDF generation for NON_TEACHING claim
