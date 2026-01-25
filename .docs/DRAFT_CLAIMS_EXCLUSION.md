# Draft Claims Exclusion from Admin Views

## Overview
Draft claims are now excluded from all admin and accountant views. Draft status indicates that a claim has not been submitted yet and should only be visible to the faculty member who created it.

## Changes Made

### Backend - Admin Controller (`admin.controller.js`)

#### 1. **Dashboard Stats** - `getDashboardStats()`
**Before:**
```javascript
COUNT(*) AS total_claims
COUNT(*) FILTER (WHERE claim_form_type = 'TEACHING_EXTERNAL') AS external_claims
```

**After:**
```javascript
COUNT(*) FILTER (WHERE status != 'draft') AS total_claims
COUNT(*) FILTER (WHERE claim_form_type = 'TEACHING_EXTERNAL' AND status != 'draft') AS external_claims
```
- Removed `draft_claims` count as it's not relevant for admin
- Total claims now excludes drafts

#### 2. **Get All Claims** - `getAllClaims()`
**Before:**
```javascript
const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
```

**After:**
```javascript
// Always exclude draft claims from admin view
where.push("e.status != 'draft'");
const whereClause = `WHERE ${where.join(' AND ')}`;
```
- Draft claims are always excluded, regardless of filters

#### 3. **Get Faculty Profile** - `getFacultyProfile()`
**Before:**
```sql
WHERE e.faculty_id = $1
```

**After:**
```sql
WHERE e.faculty_id = $1 AND e.status != 'draft'
```
- When admin views a faculty profile, draft claims are hidden

#### 4. **Get External Examiners** - `getExternalExaminers()`
**Before:**
```sql
WHERE e.claim_form_type = 'TEACHING_EXTERNAL'
```

**After:**
```sql
WHERE e.claim_form_type = 'TEACHING_EXTERNAL' AND e.status != 'draft'
```
- External examiner list excludes draft external claims

#### 5. **List All Faculty** - `listAllFaculty()`
**Before:**
```sql
COUNT(e.id) AS total_claims
```

**After:**
```sql
COUNT(e.id) FILTER (WHERE e.status != 'draft') AS total_claims
```
- Faculty claim counts exclude drafts

### Backend - Accountant Controller
**No changes needed** - Already filters by `status IN ('submitted', 'approved', 'paid')` which automatically excludes drafts.

---

## Rationale

### Why Exclude Drafts?

1. **Not Submitted**: Draft claims haven't been submitted by faculty yet
2. **Work in Progress**: They may be incomplete or contain errors
3. **Privacy**: Faculty should have privacy to work on claims before submission
4. **Accuracy**: Admin stats should reflect actual submitted claims, not drafts
5. **Workflow**: Drafts are part of faculty's personal workflow, not admin's

### Draft Status Lifecycle

```
DRAFT → SUBMITTED → APPROVED → PAID
  ↓
REJECTED (can happen from SUBMITTED or APPROVED)
```

**Draft** is the only status that should be invisible to admin/accountant.

---

## Impact on UI

### Admin Dashboard
- **Total Claims**: Now shows only submitted/approved/rejected/paid claims
- **External Claims**: Excludes draft external claims
- **Faculty Statistics**: Claim counts exclude drafts

### Admin Claims List
- Draft claims will never appear in the claims table
- Filters (status, department, etc.) work on non-draft claims only

### Admin Faculty Profile
- When viewing a specific faculty member:
  - Claims tab shows only non-draft claims
  - Statistics reflect non-draft claims only
  - Draft claims remain hidden

### Admin External Examiners
- External examiner list only shows claims that have been submitted
- Draft external claims (links generated but not submitted) are hidden

---

## Faculty Perspective (No Change)

Faculty members can still:
- Create draft claims
- Edit draft claims
- View their own draft claims
- Submit drafts (changes status from 'draft' to 'submitted')
- Delete drafts

**Draft visibility is only for the faculty who created it.**

---

## Testing Checklist

### Admin Tests
- [ ] Dashboard shows correct total claims (excluding drafts)
- [ ] Claims list doesn't show any draft claims
- [ ] Faculty profile doesn't show draft claims
- [ ] External examiners list excludes draft external claims
- [ ] Faculty list shows correct claim counts (excluding drafts)
- [ ] Filtering by status works correctly (no draft option)

### Accountant Tests
- [ ] Dashboard stats exclude drafts (already working)
- [ ] Claims list shows only submitted/approved/paid (already working)
- [ ] Faculty details exclude drafts

### Faculty Tests
- [ ] Faculty can still see their own drafts
- [ ] Faculty can edit drafts
- [ ] Faculty can submit drafts
- [ ] After submission, claim appears in admin view

---

## Database Query Pattern

**Consistent pattern across all admin queries:**

```sql
-- Single condition
WHERE e.status != 'draft'

-- With other conditions
WHERE e.faculty_id = $1 AND e.status != 'draft'

-- In aggregate functions
COUNT(e.id) FILTER (WHERE e.status != 'draft')
```

---

## Files Modified

### Backend
- `backend/src/controllers/admin.controller.js`
  - `getDashboardStats()` - Line 10, 15
  - `getAllClaims()` - Line 90-92
  - `getFacultyProfile()` - Line 342
  - `getExternalExaminers()` - Line 542
  - `listAllFaculty()` - Line 643

### Frontend
No frontend changes needed - the filtering happens at the backend level.

---

## Summary

Draft claims are now completely hidden from admin and accountant views. This ensures:
- ✅ Admin sees only actionable claims
- ✅ Statistics are accurate
- ✅ Faculty privacy is maintained
- ✅ Workflow is clear and logical
- ✅ No confusion about incomplete claims

Draft claims remain visible only to the faculty member who created them, allowing them to work on claims privately before submission.
