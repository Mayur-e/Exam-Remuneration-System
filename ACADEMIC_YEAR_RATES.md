# Academic Year Based Rates - Implementation Summary

## Overview
Implemented a comprehensive system for managing remuneration rates based on academic years. This allows administrators to configure different rates for different academic years (e.g., 2024-25, 2025-26) without affecting historical claims.

## Changes Made

### 1. Database Schema Updates
**File**: `database/migrations/add_academic_year_to_rates.sql`
- Added `academic_year VARCHAR(20)` column to:
  - `remuneration_rates`
  - `staff_role_rates`
  - `batch_sizes`
- Updated unique constraints to include `academic_year`:
  - `(exam_type, academic_year)` for remuneration_rates
  - `(staff_role, academic_year)` for staff_role_rates
  - `(program, academic_year)` for batch_sizes
- Created indexes for faster year-based queries
- Set default value to '2024-25' for backward compatibility

### 2. Calculate Exam Function Update
**File**: `database/migrations/update_calculate_exam_with_year.sql`
- Modified `calculate_exam()` PL/pgSQL function to:
  - Fetch `remuneration_rates` based on exam's `academic_year`
  - Fetch `batch_sizes` based on exam's `academic_year`
  - Fetch `staff_role_rates` based on exam's `academic_year`
- Ensures calculations use the correct rates for each claim's academic year

### 3. Backend API Updates
**File**: `backend/src/controllers/admin.controller.js`

#### New Endpoint: `getAcademicYears()`
- Returns list of all available academic years from rate tables
- Used to populate the year selector dropdown

#### Updated: `getRates()`
- Now accepts `academic_year` query parameter
- Filters all rate queries by the selected year
- Returns `academicYear` in response for confirmation

#### Updated: `updateRates()`
- Now requires `academic_year` in request body
- Updates rates only for the specified year
- Validates that academic_year is provided

#### New Endpoint: `cloneRatesToNewYear()`
- Accepts `source_year` and `target_year` in request body
- Validates that target year doesn't already exist
- Copies all rates from source to target year in a transaction
- Returns count of cloned records

**File**: `backend/src/routes/admin/adminRoutes.js`
- Added route: `GET /admin/rates/academic-years`
- Added route: `POST /admin/rates/clone`

### 4. Frontend UI Updates
**File**: `frontend/src/components/settings/RatesManagement.jsx`

#### New Features:
1. **Academic Year Selector**
   - Dropdown to select which year's rates to view/edit
   - Automatically loads available years from backend
   - Defaults to most recent year

2. **Clone to New Year Button**
   - Green button next to year selector
   - Opens modal for cloning rates
   - Validates input and prevents duplicates

3. **Clone Modal**
   - Input field for new academic year
   - Shows source year being cloned from
   - Validates format (YYYY-YY)
   - Automatically switches to new year after cloning

4. **Year-Aware Fetching**
   - Fetches rates when component mounts
   - Re-fetches rates when selected year changes
   - Displays selected year in UI

5. **Year-Aware Saving**
   - Includes `academic_year` in save request
   - Shows year in success message
   - Prevents accidental updates to wrong year

## Usage Instructions

### For Administrators:

1. **Navigate to Settings → Rates Management**
2. **Select Academic Year** from the dropdown at the top
3. **View/Edit Rates** for that specific year
4. **Save Changes** - rates will only update for the selected year

### Creating Rates for a New Year:

#### Option 1: Using the UI (Recommended)
1. **Navigate to Settings → Rates Management**
2. **Select the year** you want to copy from (e.g., 2024-25)
3. **Click "Clone to New Year"** button
4. **Enter the new year** (e.g., 2025-26)
5. **Click "Clone Rates"**
6. The system will:
   - Copy all teaching rates
   - Copy all staff role rates
   - Copy all batch sizes
   - Automatically switch to the new year
7. **Adjust rates** as needed for the new year
8. **Save Changes**

#### Option 2: Using SQL (Advanced)
```sql
-- Example: Copy 2024-25 rates to 2025-26
INSERT INTO remuneration_rates (exam_type, fy_sy_rate, ty_final_rate, mtech_mca_rate, min_per_day, academic_year)
SELECT exam_type, fy_sy_rate, ty_final_rate, mtech_mca_rate, min_per_day, '2025-26'
FROM remuneration_rates
WHERE academic_year = '2024-25';

-- Repeat for staff_role_rates and batch_sizes
```

## Migration Steps

1. **Run Database Migration**:
   ```bash
   psql -U postgres -d exam_remuneration_db -f database/migrations/add_academic_year_to_rates.sql
   ```

2. **Update Calculate Function**:
   ```bash
   psql -U postgres -d exam_remuneration_db -f database/migrations/update_calculate_exam_with_year.sql
   ```

3. **Restart Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```

4. **Test the Feature**:
   - Login as Admin
   - Go to Settings → Rates Management
   - Verify year selector appears
   - Change year and verify rates load correctly
   - Make a change and save
   - Verify success message shows correct year

## Important Notes

1. **Existing Claims**: All existing claims will use '2024-25' rates (default value)
2. **New Claims**: Will use rates based on their `academic_year` field
3. **Historical Data**: Changing rates for a year does NOT recalculate existing claims
4. **Data Integrity**: Each year's rates are completely independent

## Testing Checklist

- [ ] Database migration runs without errors
- [ ] Calculate function updated successfully
- [ ] Backend starts without errors
- [ ] Year selector appears in UI
- [ ] Can switch between years
- [ ] Rates load correctly for each year
- [ ] Can save rates for a specific year
- [ ] Success message shows correct year
- [ ] Other years' rates remain unchanged after save
- [ ] New claims use correct year's rates in calculation
