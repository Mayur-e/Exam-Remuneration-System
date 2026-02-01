# Allowances Management Implementation

## Overview
This implementation allows the **Billing Incharge** to manage Chairman Allowance and Conveyance Amount for all claims (both internal and external). These values are no longer entered by faculty or external examiners but are controlled by the Billing Incharge.

## Changes Made

### 1. Frontend - External Examiner Form
**File:** `frontend/src/pages/external/ExternalExaminerForm.jsx`

**Changes:**
- ✅ Removed Travel Allowance section (Local/Outstation selection)
- ✅ Removed state variables: `is_local`, `journey_days`, `user_entered_travel_amount`, `travelProofFile`
- ✅ Removed travel proof file upload
- ✅ Simplified form to only collect personal and bank details

### 2. Frontend - Internal Teaching Form
**File:** `frontend/src/pages/faculty/TeachingBillForm.jsx`

**Changes:**
- ✅ Removed Allowances section (Chairman & Conveyance inputs)
- ✅ Removed state variables: `chairmanAllowance`, `conveyanceAllowance`
- ✅ Updated submission to not send these values

### 3. Backend - External Controller
**File:** `backend/src/controllers/external.controller.js`

**Changes:**
- ✅ Updated `submitExternalClaim` to default travel values to 0
- ✅ Changed database query to use `DO NOTHING` on conflict to preserve Billing Incharge edits
- ✅ Removed extraction of travel-related fields from request body

### 4. Backend - Faculty Controller
**File:** `backend/src/controllers/faculty.controller.js`

**Changes:**
- ✅ Updated `submitExam` to not accept allowances from request body
- ✅ Changed database query to use `DO NOTHING` on conflict to preserve Billing Incharge edits
- ✅ Defaults both allowances to 0 on initial submission

### 5. Backend - Accountant Controller (NEW)
**File:** `backend/src/controllers/accountant.controller.js`

**New Function:** `updateAllowances`
```javascript
exports.updateAllowances = async (req, res) => {
  // Validates department access
  // Updates chairman_allowance and conveyance_amount
  // Triggers recalculation via calculate_exam()
  // Returns updated values
}
```

### 6. Backend - Routes
**File:** `backend/src/routes/accountant/accountantRoutes.js`

**New Route:**
```javascript
router.put("/claims/:id/allowances", idParamValidation, ctrl.updateAllowances);
```

### 7. Frontend - Billing Incharge View (NEW UI)
**File:** `frontend/src/pages/accountant/BillView.jsx`

**New Features:**
- ✅ **Manage Allowances Card** - Beautiful gradient card in right column
- ✅ **Edit Mode** - Toggle between view and edit modes
- ✅ **Real-time Updates** - Changes reflect immediately in Bill Summary
- ✅ **Auto-recalculation** - Triggers backend calculation on save
- ✅ **Visual Indicators** - Shows "For External Examiner" badge on conveyance field

**UI Components Added:**
1. State management for editing mode
2. Input fields for both allowances
3. Save & Cancel buttons
4. Info notice about automatic recalculation
5. Integration with existing Bill Summary component

## Workflow

### For Internal Claims (TEACHING_INTERNAL)
1. Faculty submits claim without allowances
2. Billing Incharge opens claim in BillView
3. Clicks "Edit" on Manage Allowances card
4. Enters Chairman Allowance (if applicable)
5. Enters Conveyance Amount (if applicable)
6. Clicks "Save & Recalculate"
7. System updates database and recalculates total
8. Faculty sees updated amounts in their Bill Summary

### For External Claims (TEACHING_EXTERNAL)
1. External examiner submits claim without travel details
2. Billing Incharge opens claim in BillView
3. Clicks "Edit" on Manage Allowances card
4. Enters Conveyance Amount based on travel proof documents
5. Clicks "Save & Recalculate"
6. System updates database and recalculates total
7. External examiner sees updated amounts in their view

## Database Flow

```
1. Claim Submission
   ↓
   INSERT INTO remuneration_calculations 
   (exam_id, chairman_allowance=0, conveyance_amount=0)
   ON CONFLICT DO NOTHING
   
2. Billing Incharge Update
   ↓
   UPDATE remuneration_calculations
   SET chairman_allowance = $1, conveyance_amount = $2
   WHERE exam_id = $3
   
3. Trigger Recalculation
   ↓
   SELECT calculate_exam($1)
   
4. Updated amounts visible to payee
```

## Benefits

✅ **Centralized Control** - Billing Incharge has full control over allowances
✅ **No User Errors** - Faculty/External can't enter incorrect amounts
✅ **Audit Trail** - All changes tracked through Billing Incharge actions
✅ **Flexibility** - Can update allowances at any time before payment
✅ **Transparency** - Payees can see final amounts in their Bill Summary
✅ **Automatic Recalculation** - Total, TDS, and Net amounts update instantly

## UI Preview

### Billing Incharge View
```
┌─────────────────────────────────────┐
│  Manage Allowances          [Edit]  │
├─────────────────────────────────────┤
│  Chairman Allowance (₹)             │
│  ₹500.00                            │
│                                     │
│  Conveyance Amount (₹)              │
│  [For External Examiner]            │
│  ₹1,200.00                          │
│                                     │
│  ℹ️ Note: Updating allowances will  │
│  automatically recalculate the      │
│  total bill amount and update the   │
│  payee's view.                      │
└─────────────────────────────────────┘
```

### Edit Mode
```
┌─────────────────────────────────────┐
│  Manage Allowances                  │
├─────────────────────────────────────┤
│  Chairman Allowance (₹)             │
│  [    500    ]                      │
│                                     │
│  Conveyance Amount (₹)              │
│  [For External Examiner]            │
│  [   1200    ]                      │
│                                     │
│  [Save & Recalculate]  [Cancel]    │
│                                     │
│  ℹ️ Note: Updating allowances will  │
│  automatically recalculate...       │
└─────────────────────────────────────┘
```

## Testing Checklist

- [ ] External examiner can submit without travel details
- [ ] Internal faculty can submit without allowances
- [ ] Billing Incharge can view allowances (default 0)
- [ ] Billing Incharge can edit allowances
- [ ] Save triggers recalculation
- [ ] Updated amounts visible in Bill Summary
- [ ] Cancel resets to original values
- [ ] Payee sees updated amounts in their view
- [ ] Cannot edit after payment is processed
- [ ] Department access control works correctly

## API Endpoints

### Update Allowances
```
PUT /accountant/claims/:id/allowances
Authorization: Bearer <token>
Role: BILLING_INCHARGE

Request Body:
{
  "chairman_allowance": 500,
  "conveyance_amount": 1200
}

Response:
{
  "message": "Allowances updated successfully"
}
```
