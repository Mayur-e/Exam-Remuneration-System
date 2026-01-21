# PRN Field Integration - Summary

## Overview
Added PRN (Permanent Registration Number) field to the user system, integrated with Google Auth signup flow and displayed in faculty settings.

## Database Changes

### Migration: `add_prn_to_users.sql`
- Added `prn` column to `users` table (VARCHAR(50))
- Created unique index on `prn` (allows NULL for existing users)
- Added column comment

### Schema Update: `schema.sql`
- Updated `users` table definition to include `prn` column

## Backend Changes

### Google Auth Controller (`googleAuthController.js`)
- **`registerGoogleUser`**: Accepts and validates PRN during Google signup
- Checks for PRN uniqueness before creating user
- Returns `needsBankDetails` flag for frontend notification

### Faculty Controller (`faculty.controller.js`)
- **`getProfile`**: Updated to include `prn` in SELECT query
- PRN is now returned in profile API response

## Frontend Changes

### Google Signup Modal (`GoogleSignupModal.jsx`)
- Collects PRN from new Google Auth users
- Validates PRN is not empty
- Includes department selection dropdown

### Faculty Settings (`Settings.jsx`)
- **Profile Data**: Added `prn` to profile data state
- **Profile Fields**: Added PRN field configuration with read-only hint
- **Read-Only Fields**: Added `prn` to `readOnlyFields` array
- **Display**: PRN shows as "PRN (Read-only)" with hint "PRN cannot be changed"

### Login & Register Pages
- Set `showBankDetailsNotification` flag in localStorage after Google signup
- Redirect immediately to dashboard (notification shows there)

### Faculty Dashboard (`FacultyDashboard.jsx`)
- Checks for `showBankDetailsNotification` flag on mount
- Shows 10-second warning toast if flag is present
- Toast message: "Please complete your bank account details in the Settings tab"
- Removes flag after showing to prevent repeated notifications

## User Flow

### New Google Signup:
1. User clicks "Sign in/up with Google"
2. Selects Google account (`@pccoepune.org` only)
3. **Modal appears** asking for:
   - PRN (required, unique)
   - Department (dropdown selection)
4. Submits → Account created
5. Redirected to dashboard
6. **Toast notification appears** (10 seconds, dismissible)
7. User can view/verify PRN in Settings (read-only)

### Existing User Login:
1. PRN is fetched and displayed in Settings
2. PRN field is read-only (cannot be changed)
3. Shows alongside Name, Email, and Department

## Field Properties

### PRN Field:
- **Type**: VARCHAR(50)
- **Unique**: Yes (with NULL allowed for legacy users)
- **Required**: Yes (for new Google signups)
- **Editable**: No (read-only after creation)
- **Visible**: Faculty Settings page only

## Security & Validation

- PRN uniqueness enforced at database level
- Backend validates PRN exists before user creation
- Frontend prevents PRN modification (read-only field)
- Only `@pccoepune.org` emails can register

## Files Modified

### Backend:
- `backend/src/controllers/googleAuthController.js` (new)
- `backend/src/controllers/faculty.controller.js`
- `backend/src/routes/auth/authRoutes.js`
- `backend/.env`
- `backend/package.json`

### Frontend:
- `frontend/src/components/auth/GoogleSignupModal.jsx` (new)
- `frontend/src/components/ui/Toast.jsx` (new)
- `frontend/src/pages/auth/Login.jsx`
- `frontend/src/pages/auth/Register.jsx`
- `frontend/src/pages/faculty/Settings.jsx`
- `frontend/src/pages/faculty/FacultyDashboard.jsx`
- `frontend/src/main.jsx`
- `frontend/src/index.css`
- `frontend/.env`
- `frontend/package.json`

### Database:
- `database/migrations/add_prn_to_users.sql` (new)
- `schema.sql`

### Documentation:
- `GOOGLE_AUTH_SETUP.md` (new)

## Testing Checklist

- [x] PRN collected during Google signup
- [x] PRN uniqueness validation works
- [x] PRN displayed in Faculty Settings
- [x] PRN field is read-only
- [x] Toast notification appears after signup
- [x] Toast dismisses after 10 seconds
- [x] Toast has working close button
- [x] Existing users can login without PRN modal
- [x] Backend returns PRN in profile API
- [x] Database migration created
