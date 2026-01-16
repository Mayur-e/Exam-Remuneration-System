# Local Conveyance Allowance (LCA) Implementation Summary

## ✅ Changes Completed

### 1. Database Migration
**File**: `database/migrations/add_travel_allowance_to_external_examiners.sql`

Added 3 new columns to `external_examiners` table:
- `is_local` (BOOLEAN): True if within 25km, False if beyond
- `journey_days` (INTEGER): Number of days/visits for LCA calculation
- `travel_allowance` (NUMERIC): Calculated or user-entered amount

### 2. Backend Controller
**File**: `backend/src/controllers/external.controller.js`

**Updated `submitExternalClaim` function**:
- Accepts new fields: `is_local`, `journey_days`, `user_entered_travel_amount`
- **Calculation Logic**:
  - **< 25km (Local)**: `travel_allowance = 500 × journey_days`
  - **> 25km (Outstation)**: `travel_allowance = user_entered_travel_amount`
- Stores `travel_allowance` in `external_examiners` table
- Saves to `remuneration_calculations.conveyance_amount` for calculation

### 3. Frontend Form
**File**: `frontend/src/pages/external/ExternalExaminerForm.jsx`

**New Travel Allowance Section**:
- Radio buttons to select distance: "Within 25km" vs "Beyond 25km"
- **Within 25km (Blue Box)**:
  - Shows "LCA Rate: ₹500 per day/visit"
  - Input: Number of days/visits
  - Real-time calculation display: "Total LCA: ₹X"
- **Beyond 25km (Amber Box)**:
  - Shows "Includes: TA + DA + Auto (Max ₹200)"
  - Input: Total travel expense
  - Warning: "Please attach proofs. Accountant will validate."

## 🔄 How It Works

### For Local Examiners (< 25km)
1. External examiner selects "Within 25km"
2. Enters number of days (e.g., 2)
3. System calculates: ₹500 × 2 = ₹1000
4. Amount saved to database automatically

### For Outstation Examiners (> 25km)
1. External examiner selects "Beyond 25km"
2. Enters total travel expense (e.g., ₹1500)
3. Reminded to attach proof documents
4. Accountant validates against norms manually

## 📋 Migration Steps

### Step 1: Run Database Migration
```bash
cd d:\Bill\exam-remuneration-system
psql -U postgres -d ERMS -f database\migrations\add_travel_allowance_to_external_examiners.sql
```

### Step 2: Test the Form
1. Navigate to external examiner link
2. Fill in personal and bank details
3. **Test Local**:
   - Select "Within 25km"
   - Enter 1 day
   - Verify "Total LCA: ₹500" shows
4. **Test Outstation**:
   - Select "Beyond 25km"
   - Enter ₹1200
   - Verify warning message shows
5. Submit form
6. Verify in database:
   ```sql
   SELECT * FROM external_examiners ORDER BY id DESC LIMIT 1;
   SELECT * FROM remuneration_calculations WHERE exam_id = <exam_id>;
   ```

## 🎯 Key Features

✅ **Distance-Based Logic**: Automatic calculation for < 25km  
✅ **Manual Entry**: Flexible input for > 25km  
✅ **Visual Feedback**: Color-coded boxes (Blue for local, Amber for outstation)  
✅ **Real-Time Calculation**: Shows total LCA immediately  
✅ **Validation Reminder**: Warns users to attach proofs  
✅ **Accountant-Friendly**: Manual validation workflow supported

## 🔍 Testing Checklist

- [ ] Run migration script
- [ ] Verify columns added to `external_examiners`
- [ ] Create external teaching claim
- [ ] Generate external link
- [ ] Open link in incognito/new browser
- [ ] Test "Within 25km" with 2 days → Verify ₹1000
- [ ] Test "Beyond 25km" with ₹1500 → Verify ₹1500
- [ ] Submit form
- [ ] Check `external_examiners` table for correct values
- [ ] Check `remuneration_calculations.conveyance_amount`
