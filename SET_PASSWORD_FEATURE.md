# Set Password Feature for Google Users

## Overview
This feature allows users who signed up with Google OAuth to set a password for their account, enabling them to login using either:
1. **Google Sign-In** (their original method)
2. **Email and Password** (after setting a password)

## Problem Solved
Previously, users who signed up with Google had a randomly generated password that they didn't know. This meant they could **only** login using Google Sign-In. If they wanted to use email/password login, they had no way to do so.

## Solution
We've implemented a "Set Password" feature that:
- Detects if a user signed up with Google (via `google_id` column)
- Shows a different UI in the Security Settings for Google users
- Allows them to set a password without needing to know their current password
- Validates the password and stores it securely

---

## Database Changes

### Migration: `add_google_id_to_users.sql`
```sql
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) DEFAULT NULL;

CREATE INDEX idx_users_google_id ON users(google_id);
```

**Purpose**: 
- `google_id` stores the Google user ID (from `payload.sub`)
- Used to identify users who signed up with Google
- Indexed for faster lookups

### Updated Schema
The `users` table now includes:
```sql
CREATE TABLE public.users (
    ...
    prn character varying(50),
    google_id character varying(255),
    ...
);
```

---

## Backend Changes

### 1. Google Auth Controller (`googleAuthController.js`)
**Updated**: Now saves `google_id` when registering a new Google user

```javascript
const result = await pool.query(
    `INSERT INTO users (name, email, password, role, department, prn, google_id)
     VALUES ($1, $2, $3, 'FACULTY', $4, $5, $6)
     RETURNING id, name, email, role, department, prn, google_id`,
    [name, email, hashedPassword, department, prn, payload.sub]
);
```

### 2. Auth Controller (`authController.js`)
**New Function**: `setPassword`

```javascript
exports.setPassword = async (req, res) => {
  // Validates that user has google_id (signed up with Google)
  // Allows setting password without current password
  // Hashes and stores the new password
}
```

**Validation**:
- Checks if user exists
- Verifies user has `google_id` (is a Google user)
- Validates password length (min 6 characters)
- Ensures newPassword and confirmPassword match

### 3. Auth Routes (`authRoutes.js`)
**New Route**: 
```javascript
router.post("/set-password", auth, authController.setPassword);
```

### 4. Faculty Controller (`faculty.controller.js`)
**Updated**: `getProfile` now returns `google_id`

```javascript
const user = await pool.query(
    `SELECT id, name, email, department, prn, google_id, created_at FROM users WHERE id=$1`,
    [facultyId]
);
```

---

## Frontend Changes

### 1. Security Settings Component (`SecuritySettings.jsx`)
**New Props**:
- `isGoogleUser` - Boolean to detect Google users
- `onSetPassword` - Callback for setting password (Google users)

**Conditional UI**:
- **Google Users**: 
  - Shows blue info banner explaining they can set a password
  - Hides "Current Password" field
  - Button text: "Set Password"
  
- **Regular Users**:
  - Shows "Current Password" field
  - Button text: "Change Password"

**Validation**:
- Skips current password validation for Google users
- Validates new password (min 6 characters)
- Ensures passwords match

### 2. Settings Page (`Settings.jsx`)
**Updated**:
- Fetches `google_id` from profile API
- Stores `google_id` in `profileData` state
- Passes `isGoogleUser={profileData?.google_id ? true : false}` to SecuritySettings
- Implements `handleSetPassword` function that calls `/auth/set-password`

---

## User Flow

### For Google Users (First Time Setting Password)

1. **User navigates to Settings**
2. **Security Settings section shows**:
   - Blue info banner: "You signed up with Google. Set a password below to enable email/password login as an alternative to Google Sign-In."
   - Two password fields: "New Password" and "Confirm New Password"
   - Button: "Set Password"

3. **User enters and confirms password**
4. **On submit**:
   - Frontend calls `POST /auth/set-password`
   - Backend validates:
     - User has `google_id`
     - Password meets requirements
     - Passwords match
   - Password is hashed and stored
   - Success message: "Password set successfully! You can now login with email and password."

5. **User can now login using**:
   - Google Sign-In (original method)
   - Email + Password (newly set)

### For Regular Users (Changing Password)

1. **User navigates to Settings**
2. **Security Settings section shows**:
   - Three password fields: "Current Password", "New Password", "Confirm New Password"
   - Button: "Change Password"

3. **User enters current password and new password**
4. **On submit**:
   - Frontend calls `POST /auth/change-password`
   - Backend validates current password
   - New password is hashed and stored

---

## Security Considerations

1. **Google ID Verification**: Only users with a `google_id` can use the set password feature
2. **Password Hashing**: All passwords are hashed using bcrypt (10 rounds)
3. **JWT Authentication**: Set password endpoint requires valid JWT token
4. **Validation**: Both frontend and backend validate password requirements
5. **No Current Password Required**: Google users don't need to know their random password

---

## API Endpoints

### POST `/auth/set-password`
**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "newPassword": "string (min 6 chars)",
  "confirmPassword": "string (must match newPassword)"
}
```

**Success Response** (200):
```json
{
  "message": "Password set successfully. You can now login with email and password."
}
```

**Error Responses**:
- `400`: Validation errors (passwords don't match, too short, etc.)
- `400`: "This feature is only for Google sign-up users" (if user doesn't have google_id)
- `404`: User not found
- `500`: Server error

---

## Testing

### Manual Testing Steps

1. **Create a Google user**:
   - Go to Login/Register page
   - Click "Sign in with Google"
   - Complete Google OAuth flow
   - Enter PRN and Department

2. **Verify Google user can set password**:
   - Navigate to Settings
   - Check Security Settings shows Google user UI
   - Enter new password (min 6 chars)
   - Confirm password
   - Click "Set Password"
   - Verify success message

3. **Test email/password login**:
   - Logout
   - Go to Login page
   - Enter email and newly set password
   - Verify successful login

4. **Test Google login still works**:
   - Logout
   - Go to Login page
   - Click "Sign in with Google"
   - Verify successful login

5. **Verify regular users see change password UI**:
   - Login as a regular user (not Google)
   - Navigate to Settings
   - Check Security Settings shows "Current Password" field
   - Verify button says "Change Password"

---

## Migration Instructions

### To Apply This Feature

1. **Run the database migration**:
   ```bash
   psql -U postgres -d ERMS -f database/migrations/add_google_id_to_users.sql
   ```

2. **Restart the backend server** (if running):
   ```bash
   cd backend
   npm run dev
   ```

3. **Restart the frontend** (if running):
   ```bash
   cd frontend
   npm run dev
   ```

### Rollback (if needed)

To remove the `google_id` column:
```sql
DROP INDEX IF EXISTS idx_users_google_id;
ALTER TABLE users DROP COLUMN google_id;
```

---

## Future Enhancements

1. **Password Reset via Email**: Allow Google users to reset their password via email
2. **Account Linking**: Allow regular users to link their Google account
3. **Two-Factor Authentication**: Add 2FA for enhanced security
4. **Password Strength Meter**: Visual indicator of password strength
5. **Password History**: Prevent reuse of recent passwords

---

## Files Modified

### Backend
- `backend/src/controllers/googleAuthController.js` - Save google_id on registration
- `backend/src/controllers/authController.js` - Add setPassword function
- `backend/src/routes/auth/authRoutes.js` - Add set-password route
- `backend/src/controllers/faculty.controller.js` - Return google_id in profile

### Frontend
- `frontend/src/components/settings/SecuritySettings.jsx` - Conditional UI for Google users
- `frontend/src/pages/faculty/Settings.jsx` - Handle setPassword and pass isGoogleUser prop

### Database
- `database/migrations/add_google_id_to_users.sql` - Migration file
- `schema.sql` - Updated schema with google_id column

---

## Summary

This feature provides a seamless experience for Google users who want the flexibility to login with either Google OAuth or email/password. It maintains security by:
- Only allowing Google users to set passwords (verified via google_id)
- Requiring proper password validation
- Using secure password hashing
- Maintaining JWT authentication

Users now have full control over their authentication methods! 🎉
