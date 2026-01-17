# Complete System Flow Testing & Refinement Plan

## Overview
This document outlines the complete end-to-end flows for all three user roles in the Exam Remuneration System, with detailed checkpoints for testing and refinement.

---

## 1. FACULTY WORKFLOW

### 1.1 Login & Dashboard
- [ ] Login with faculty credentials
- [ ] Verify dashboard loads with correct stats
- [ ] Check "My Claims" count matches database
- [ ] Verify "Pending Approval" count is accurate
- [ ] Check "Total Earnings" calculation

### 1.2 Create Teaching Claim (Internal)
**Path**: Dashboard → Create Claim → Teaching (Internal)

**Steps**:
1. [ ] Click "Create New Claim"
2. [ ] Select "Teaching (Internal)"
3. [ ] Fill exam details:
   - [ ] Exam Type (Theory/Practical/Oral)
   - [ ] Program (BTECH/MTECH/MCA/BVOC)
   - [ ] Level (FY/SY/TY/Final)
   - [ ] Subject Name & Code
   - [ ] Semester, Academic Year
   - [ ] Exam Date
   - [ ] Students Count
4. [ ] Verify auto-calculation happens
5. [ ] Check calculated amount is correct
6. [ ] Save as Draft
7. [ ] Verify draft appears in "My Claims"
8. [ ] Edit draft and submit
9. [ ] Verify status changes to "Submitted"
10. [ ] Check audit log shows "Submitted" action

**Validation Points**:
- [ ] Calculation formula matches rate master
- [ ] Minimum rates applied correctly
- [ ] TDS/Professional Tax calculated correctly
- [ ] Net amount = Total - TDS - PT

### 1.3 Create Teaching Claim (External)
**Path**: Dashboard → Create Claim → Teaching (External)

**Steps**:
1. [ ] Click "Create New Claim"
2. [ ] Select "Teaching (External)"
3. [ ] Fill exam details (same as internal)
4. [ ] Click "Generate External Link"
5. [ ] Verify link is generated
6. [ ] Copy link and verify it's accessible
7. [ ] Check link shows in "My Claims" with status "Draft"
8. [ ] Open link in incognito/different browser
9. [ ] Fill external examiner details:
   - [ ] Full Name, Email, Mobile
   - [ ] Parent Institute
   - [ ] PAN Number
   - [ ] Bank Details (Name, Branch, Account, IFSC)
   - [ ] Upload PAN document
   - [ ] Upload Cancelled Cheque
   - [ ] Select Local/Outstation
   - [ ] Enter journey days (if local)
   - [ ] Upload travel proof (if outstation)
10. [ ] Submit external claim
11. [ ] Verify claim status changes to "Submitted"
12. [ ] Check travel allowance calculated correctly
13. [ ] Verify documents are uploaded

**Validation Points**:
- [ ] Link expires after 7 days
- [ ] Link cannot be reused after submission
- [ ] External examiner data saved correctly
- [ ] Travel allowance: Local = ₹500 × days, Outstation = user-entered
- [ ] All documents accessible

### 1.4 Create Non-Teaching Claim
**Path**: Dashboard → Create Claim → Non-Teaching

**Steps**:
1. [ ] Click "Create New Claim"
2. [ ] Select "Non-Teaching"
3. [ ] Fill exam details
4. [ ] Add staff members:
   - [ ] Name, Role, Count, Hours
   - [ ] Verify rate auto-fills
   - [ ] Check amount calculation
5. [ ] Add multiple staff entries
6. [ ] Verify total calculation
7. [ ] Save as Draft
8. [ ] Submit claim
9. [ ] Verify status changes to "Submitted"

**Validation Points**:
- [ ] Staff norms table rates applied correctly
- [ ] Total = Sum of all staff amounts
- [ ] TDS/PT calculated on total

### 1.5 Bank Account Management
**Path**: Dashboard → Profile → Bank Details

**Steps**:
1. [ ] Navigate to Bank Details
2. [ ] Add new bank account:
   - [ ] Account Holder Name
   - [ ] Bank Name, Branch
   - [ ] Account Number, IFSC
   - [ ] Account Type
   - [ ] PAN Number
3. [ ] Save bank details
4. [ ] Verify details saved correctly
5. [ ] Edit bank details
6. [ ] Verify changes saved

**Validation Points**:
- [ ] Only one bank account per faculty
- [ ] Bank details shown in claim view
- [ ] Cannot submit claim without bank details

### 1.6 View Claim Details
**Path**: My Claims → View

**Steps**:
1. [ ] Click "View" on any claim
2. [ ] Verify all exam details displayed
3. [ ] Check calculation breakdown:
   - [ ] Base amount
   - [ ] TDS amount
   - [ ] Professional Tax
   - [ ] Net amount
4. [ ] View audit log
5. [ ] Check all actions logged with timestamps

**Validation Points**:
- [ ] All fields read-only after submission
- [ ] Calculation breakdown accurate
- [ ] Audit log complete

### 1.7 Handle Rejection
**Path**: My Claims → View Rejected Claim

**Steps**:
1. [ ] View rejected claim
2. [ ] Read rejection reason
3. [ ] Check if policy reference provided
4. [ ] Edit claim (if sent back to draft)
5. [ ] Make corrections
6. [ ] Resubmit claim
7. [ ] Verify resubmission logged

**Validation Points**:
- [ ] Rejection reason clearly visible
- [ ] Can edit only if status = "draft"
- [ ] Cannot edit if status = "rejected"

---

## 2. ACCOUNTANT WORKFLOW

### 2.1 Login & Dashboard
- [ ] Login with accountant credentials
- [ ] Verify dashboard stats:
   - [ ] Pending Bills count
   - [ ] Approved Bills count
   - [ ] Paid Bills count
   - [ ] Pending Amount
   - [ ] Paid Amount
- [ ] Check recent activities

### 2.2 View Submitted Bills
**Path**: Dashboard → Bills

**Steps**:
1. [ ] Navigate to Bills
2. [ ] Verify all submitted claims visible
3. [ ] Test filters:
   - [ ] Filter by status (Submitted/Approved/Paid/Rejected)
   - [ ] Search by faculty name
   - [ ] Filter by department
   - [ ] Filter by exam type
4. [ ] Clear filters
5. [ ] Verify pagination works

**Validation Points**:
- [ ] Only submitted/approved claims visible
- [ ] Draft claims not visible
- [ ] Filters work correctly

### 2.3 Review & Approve Claim
**Path**: Bills → View → Approve

**Steps**:
1. [ ] Click "View" on submitted claim
2. [ ] Review exam details
3. [ ] Check calculation breakdown:
   - [ ] Verify rate applied
   - [ ] Check if minimum rate applied
   - [ ] Verify TDS calculation (10%)
   - [ ] Verify PT calculation (₹200)
   - [ ] Check net amount
4. [ ] Review bank details
5. [ ] For external claims:
   - [ ] Verify external examiner details
   - [ ] Check uploaded documents (PAN, Cheque, Travel)
   - [ ] Verify travel allowance
6. [ ] For non-teaching claims:
   - [ ] Review staff allocation
   - [ ] Verify staff norms applied
7. [ ] Click "Approve"
8. [ ] Verify status changes to "Approved"
9. [ ] Check audit log updated

**Validation Points**:
- [ ] All calculations accurate
- [ ] Documents complete
- [ ] Bank details present
- [ ] Approval logged with accountant name

### 2.4 Reject Claim
**Path**: Bills → View → Reject

**Steps**:
1. [ ] Click "View" on submitted claim
2. [ ] Click "Reject"
3. [ ] Enter rejection reason (required)
4. [ ] Submit rejection
5. [ ] Verify status changes to "Rejected"
6. [ ] Check faculty can see rejection reason
7. [ ] Verify audit log updated

**Validation Points**:
- [ ] Rejection reason mandatory
- [ ] Rejection logged with timestamp
- [ ] Faculty notified (if notification system exists)

### 2.5 Mark Payment
**Path**: Bills → View Approved → Mark as Paid

**Steps**:
1. [ ] Filter approved claims
2. [ ] Click "View" on approved claim
3. [ ] Click "Mark as Paid"
4. [ ] Enter payment details:
   - [ ] Transaction ID
   - [ ] Payment Date
   - [ ] Payment Mode
   - [ ] Remarks (optional)
5. [ ] Submit payment
6. [ ] Verify status changes to "Paid"
7. [ ] Check payment record created
8. [ ] Verify audit log updated

**Validation Points**:
- [ ] Can only mark approved claims as paid
- [ ] Transaction ID required
- [ ] Payment date cannot be future
- [ ] Payment logged correctly

### 2.6 Generate Reports
**Path**: Dashboard → Reports (if implemented)

**Steps**:
1. [ ] Select date range
2. [ ] Filter by department/exam type
3. [ ] Generate report
4. [ ] Verify data accuracy
5. [ ] Export to PDF/Excel

**Validation Points**:
- [ ] Report data matches database
- [ ] Totals calculated correctly

---

## 3. ADMIN WORKFLOW

### 3.1 Login & Dashboard
- [ ] Login with admin credentials
- [ ] Verify system summary cards:
   - [ ] Total Claims
   - [ ] Submitted Claims
   - [ ] Approved Claims
   - [ ] Paid Claims
   - [ ] Rejected Claims
   - [ ] External Claims
   - [ ] Draft Claims
- [ ] Check alerts section:
   - [ ] Claims pending beyond 7 days
   - [ ] Repeated rejections
   - [ ] External claims without documents
   - [ ] Rate mismatch flags

### 3.2 View All Claims
**Path**: Dashboard → Claims

**Steps**:
1. [ ] Navigate to Claims
2. [ ] Verify all claims visible (all statuses)
3. [ ] Test filters:
   - [ ] Status tabs (All/Draft/Submitted/Approved/Paid/Rejected)
   - [ ] Search by faculty/subject/exam type/department
   - [ ] Clear filters
4. [ ] Verify claim counts accurate

**Validation Points**:
- [ ] Can see ALL claims (including drafts)
- [ ] Filters work correctly
- [ ] Search is case-insensitive

### 3.3 View Claim Details
**Path**: Claims → View

**Steps**:
1. [ ] Click "View" on any claim
2. [ ] Navigate through tabs:
   - [ ] **Details Tab**:
     - [ ] Exam information
     - [ ] Claimant details
     - [ ] Bank details (read-only)
     - [ ] Staff allocation (for non-teaching)
   - [ ] **Calculation Tab**:
     - [ ] Bill summary (read-only)
     - [ ] Rate applied
     - [ ] TDS/PT breakdown
   - [ ] **Audit Logs Tab**:
     - [ ] All actions with timestamps
     - [ ] Action by (name + role)
     - [ ] Comments
3. [ ] Verify all data read-only
4. [ ] Cannot edit financial values

**Validation Points**:
- [ ] All tabs load correctly
- [ ] Data is read-only
- [ ] Audit log complete

### 3.4 Reject Claim (Admin)
**Path**: Claims → View → Reject

**Steps**:
1. [ ] Click "Reject Claim"
2. [ ] Enter rejection reason (required)
3. [ ] Enter policy reference (optional)
4. [ ] Submit rejection
5. [ ] Verify status changes to "Rejected"
6. [ ] Check audit log shows "ADMIN" role
7. [ ] Verify faculty can see reason + policy ref

**Validation Points**:
- [ ] Rejection reason mandatory
- [ ] Policy reference optional but recommended
- [ ] Logged as ADMIN action

### 3.5 Send Back for Correction
**Path**: Claims → View → Send Back

**Steps**:
1. [ ] Click "Send Back"
2. [ ] Enter correction instructions (required)
3. [ ] Submit
4. [ ] Verify status changes to "Draft"
5. [ ] Check faculty can edit claim
6. [ ] Verify audit log shows "SENT_BACK" action
7. [ ] Faculty makes corrections and resubmits
8. [ ] Verify resubmission logged

**Validation Points**:
- [ ] Instructions mandatory
- [ ] Status changes to draft
- [ ] Faculty can edit
- [ ] Logged as ADMIN action

### 3.6 Faculty Oversight
**Path**: Dashboard → Faculty

**Steps**:
1. [ ] Navigate to Faculty list
2. [ ] Search by name/email/department
3. [ ] Verify statistics:
   - [ ] Total claims
   - [ ] Pending claims
   - [ ] Rejected claims
4. [ ] Click "View Profile" on any faculty
5. [ ] Verify profile page shows:
   - [ ] Personal information
   - [ ] Bank details (read-only)
   - [ ] Statistics summary
   - [ ] Complete claims history
   - [ ] Rejection history (if any)
   - [ ] External links generated (if any)

**Validation Points**:
- [ ] All faculty visible
- [ ] Statistics accurate
- [ ] Profile data complete
- [ ] Bank details read-only

### 3.7 External Examiner Supervision
**Path**: Dashboard → External

**Steps**:
1. [ ] Navigate to External Supervision
2. [ ] Test filters:
   - [ ] Search by name/email/institute/faculty
   - [ ] Filter by department
   - [ ] Filter by claim status
3. [ ] View external examiner details:
   - [ ] Name, email, mobile
   - [ ] Institute
   - [ ] Exam details
   - [ ] Generated by (faculty)
   - [ ] Document status
   - [ ] Claim status
4. [ ] Expand row to view documents:
   - [ ] Click chevron to expand
   - [ ] Verify PAN document preview
   - [ ] Verify Cheque document preview
   - [ ] Verify Travel proof preview (if applicable)
   - [ ] Click "Open in New Tab" for each document
5. [ ] Click "View Claim" to see full claim details

**Validation Points**:
- [ ] All external examiners visible
- [ ] Filters work correctly
- [ ] Documents display correctly
- [ ] Can expand/collapse rows
- [ ] Images load properly

### 3.8 Audit Logs
**Path**: Dashboard → Audit Logs

**Steps**:
1. [ ] Navigate to Audit Logs
2. [ ] Test filters:
   - [ ] Filter by Exam ID
   - [ ] Filter by Action Type (Submitted/Approved/Rejected/Sent Back)
   - [ ] Filter by Date Range (From/To)
3. [ ] Verify log entries show:
   - [ ] Action type (color-coded)
   - [ ] Exam details
   - [ ] Action by (name + role)
   - [ ] Timestamp
   - [ ] Comments
4. [ ] Clear filters
5. [ ] Verify limited to 500 entries

**Validation Points**:
- [ ] All actions logged
- [ ] Filters work correctly
- [ ] Timestamps accurate
- [ ] Immutable (cannot edit/delete)

### 3.9 Settings
**Path**: Dashboard → Settings

**Steps**:
1. [ ] Navigate to Settings
2. [ ] Switch between tabs:
   - [ ] Profile Settings
   - [ ] System Configuration
3. [ ] Update profile name
4. [ ] Verify email is read-only
5. [ ] Check system configuration placeholders

**Validation Points**:
- [ ] Profile updates save
- [ ] Email cannot be changed
- [ ] System config shows placeholders

---

## 4. CROSS-ROLE INTEGRATION TESTING

### 4.1 Complete Claim Lifecycle (Happy Path)
1. [ ] **Faculty**: Create teaching claim → Submit
2. [ ] **Accountant**: Review → Approve
3. [ ] **Accountant**: Mark as Paid
4. [ ] **Faculty**: Verify status = "Paid"
5. [ ] **Admin**: View audit log (should show all actions)

### 4.2 Rejection Flow
1. [ ] **Faculty**: Create claim → Submit
2. [ ] **Accountant**: Review → Reject with reason
3. [ ] **Faculty**: View rejection reason
4. [ ] **Admin**: View claim (should see rejection)

### 4.3 Admin Intervention Flow
1. [ ] **Faculty**: Create claim → Submit
2. [ ] **Accountant**: Approve
3. [ ] **Admin**: View claim → Send Back with instructions
4. [ ] **Faculty**: Edit claim → Resubmit
5. [ ] **Accountant**: Review → Approve
6. [ ] **Accountant**: Mark as Paid

### 4.4 External Claim Flow
1. [ ] **Faculty**: Create external claim → Generate link
2. [ ] **External Examiner**: Fill form → Upload docs → Submit
3. [ ] **Accountant**: Review external claim → Verify docs → Approve
4. [ ] **Admin**: View external supervision → Verify all docs visible
5. [ ] **Accountant**: Mark as Paid

---

## 5. DATA VALIDATION & EDGE CASES

### 5.1 Calculation Accuracy
- [ ] Test with minimum student count (should apply minimum rate)
- [ ] Test with maximum student count
- [ ] Verify TDS = 10% of total
- [ ] Verify PT = ₹200 (flat)
- [ ] Test different exam types (Theory/Practical/Oral)
- [ ] Test different programs (BTECH/MTECH/MCA/BVOC)
- [ ] Test different levels (FY/SY/TY/Final)

### 5.2 Document Upload
- [ ] Upload valid image (JPG/PNG)
- [ ] Upload valid PDF
- [ ] Try uploading invalid file type
- [ ] Try uploading oversized file
- [ ] Verify file size limits

### 5.3 Date Validations
- [ ] Exam date cannot be future
- [ ] Payment date cannot be future
- [ ] Link expiry works correctly (7 days)

### 5.4 Permission Checks
- [ ] Faculty cannot access accountant routes
- [ ] Accountant cannot access admin routes
- [ ] Admin cannot edit financial values
- [ ] Verify role-based access control

---

## 6. UI/UX REFINEMENTS

### 6.1 Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)

### 6.2 Loading States
- [ ] Verify spinners show during API calls
- [ ] Check skeleton loaders (if any)
- [ ] Test slow network conditions

### 6.3 Error Handling
- [ ] Test with invalid credentials
- [ ] Test with network errors
- [ ] Test with server errors (500)
- [ ] Verify error messages are user-friendly

### 6.4 Empty States
- [ ] No claims yet
- [ ] No search results
- [ ] No documents uploaded
- [ ] No audit logs

### 6.5 Navigation
- [ ] Verify breadcrumbs (if any)
- [ ] Test back buttons
- [ ] Check active link highlighting
- [ ] Test logout functionality

---

## 7. PERFORMANCE TESTING

- [ ] Test with 100+ claims
- [ ] Test with 50+ faculty members
- [ ] Test pagination performance
- [ ] Check image loading performance
- [ ] Verify API response times

---

## 8. SECURITY TESTING

- [ ] Verify JWT token expiry
- [ ] Test unauthorized access
- [ ] Check SQL injection prevention
- [ ] Verify file upload security
- [ ] Test CORS settings

---

## TESTING PRIORITY

**High Priority** (Must Test):
1. Complete claim lifecycle (Faculty → Accountant → Admin)
2. Calculation accuracy
3. Role-based access control
4. Document upload/view
5. Audit logging

**Medium Priority** (Should Test):
6. All filters and search
7. External claim flow
8. Rejection/Send back flows
9. Bank account management
10. Payment marking

**Low Priority** (Nice to Test):
11. UI/UX refinements
12. Performance testing
13. Edge cases
14. Settings page

---

## NEXT STEPS

1. Start with **Faculty Workflow** (1.1 - 1.7)
2. Move to **Accountant Workflow** (2.1 - 2.6)
3. Test **Admin Workflow** (3.1 - 3.9)
4. Run **Integration Tests** (4.1 - 4.4)
5. Validate **Data & Edge Cases** (5.1 - 5.4)
6. Refine **UI/UX** (6.1 - 6.5)
