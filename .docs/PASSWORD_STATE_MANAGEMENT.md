# Password State Management for Google Users

## Overview
This enhancement ensures that once a Google user sets their password, they see the regular "Change Password" UI (with current password field) instead of the "Set Password" UI.

## Problem
Previously, Google users would always see the "Set Password" UI even after setting a password, because we only checked for `google_id`. This meant they couldn't change their password using the normal flow.

## Solution
Added a `has_set_password` boolean flag to track whether a user has set their own password.

---

## Database Changes

### Migration: `add_password_set_flag.sql`
```sql
ALTER TABLE users 
ADD COLUMN has_set_password BOOLEAN DEFAULT false;

-- Update existing users who don't have google_id (regular users) to true
UPDATE users 
SET has_set_password = true 
WHERE google_id IS NULL;
```

**Logic**:
- `has_set_password = false`: User signed up with Google and hasn't set a password yet → Show "Set Password" UI
- `has_set_password = true`: User has set their own password → Show "Change Password" UI
- Regular users (no `google_id`): Always `true` → Show "Change Password" UI

---

## Backend Changes

### 1. Auth Controller (`authController.js`)

#### `registerFaculty` - Updated
```javascript
await pool.query(
    `INSERT INTO users (name, email, password, role, department, has_set_password)
     VALUES ($1, $2, $3, 'FACULTY', $4, true)`,
    [name, email, hashedPassword, department]
);
```
- Regular users who register with email/password have `has_set_password = true`

#### `setPassword` - Updated
```javascript
await pool.query(
  "UPDATE users SET password = $1, has_set_password = true WHERE id = $2",
  [hashedPassword, userId]
);
```
- When Google user sets password, `has_set_password` is set to `true`
- Next time they visit Settings, they'll see "Change Password" UI

### 2. Faculty Controller (`faculty.controller.js`)

#### `getProfile` - Updated
```javascript
const user = await pool.query(
    `SELECT id, name, email, department, prn, google_id, has_set_password, created_at FROM users WHERE id=$1`,
    [facultyId]
);
```
- Returns `has_set_password` to frontend

---

## Frontend Changes

### Settings Page (`Settings.jsx`)

#### State Management
```javascript
setProfileData({
  name: res.data.name || "",
  email: res.data.email || user.email || "",
  department: res.data.department || "",
  prn: res.data.prn || "",
  google_id: res.data.google_id || null,
  has_set_password: res.data.has_set_password || false,
});
```

#### Conditional Logic
```javascript
<SecuritySettings
  onSave={handleChangePassword}
  onSetPassword={handleSetPassword}
  isGoogleUser={profileData?.google_id && !profileData?.has_set_password}
  primaryColor="blue-600"
/>
```

**Key Logic**: 
- `isGoogleUser = true` when: User has `google_id` AND has NOT set password
- `isGoogleUser = false` when: User has no `google_id` OR has already set password

#### Refresh After Setting Password
```javascript
const handleSetPassword = async (passwordData) => {
  try {
    await api.post("/auth/set-password", { ... });
    setMessage({ type: "success", text: "..." });
    
    // Refresh profile to update has_set_password flag
    await fetchProfileAndBank();
  } catch (error) {
    // error handling
  }
};
```
- After successfully setting password, profile is refreshed
- UI automatically switches to "Change Password" mode

---

## User Flow

### Scenario 1: Google User - First Time (No Password Set)

1. **User signs up with Google**
   - `google_id` = "12345..."
   - `has_set_password` = false
   - Password = random hash (unknown to user)

2. **User visits Settings → Security**
   - Sees: Blue banner "You signed up with Google..."
   - Sees: "New Password" and "Confirm Password" fields
   - Button: "Set Password"

3. **User sets password**
   - Enters and confirms password
   - Clicks "Set Password"
   - Backend updates: `has_set_password = true`
   - Frontend refreshes profile data
   - **UI automatically changes** to "Change Password" mode

### Scenario 2: Google User - After Setting Password

1. **User visits Settings → Security**
   - `google_id` = "12345..."
   - `has_set_password` = true
   - Sees: "Current Password", "New Password", "Confirm Password"
   - Button: "Change Password"

2. **User can now change password normally**
   - Must enter current password (the one they set)
   - Can set new password

### Scenario 3: Regular User (Email/Password Signup)

1. **User registers with email/password**
   - `google_id` = null
   - `has_set_password` = true

2. **User visits Settings → Security**
   - Always sees: "Current Password", "New Password", "Confirm Password"
   - Button: "Change Password"

---

## State Matrix

| google_id | has_set_password | UI Shown | Can Login With |
|-----------|------------------|----------|----------------|
| NULL | true | Change Password | Email + Password |
| "123..." | false | Set Password | Google Only |
| "123..." | true | Change Password | Google OR Email + Password |

---

## Migration Instructions

### Apply Migration

```bash
psql -U postgres -d ERMS -f database/migrations/add_password_set_flag.sql
```

This will:
1. Add `has_set_password` column (default false)
2. Set `has_set_password = true` for all existing regular users
3. Leave `has_set_password = false` for existing Google users (if any)

### Verify Migration

```sql
-- Check column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'has_set_password';

-- Check existing users
SELECT id, email, google_id, has_set_password FROM users;
```

---

## Testing Checklist

### Test 1: New Google User
- [ ] Sign up with Google
- [ ] Go to Settings → Security
- [ ] Verify "Set Password" UI is shown
- [ ] Set a password
- [ ] Verify success message
- [ ] **Verify UI changes to "Change Password"** without page reload
- [ ] Logout and login with email + password
- [ ] Go to Settings → Security again
- [ ] Verify "Change Password" UI is shown

### Test 2: Existing Google User (Before Migration)
- [ ] Run migration
- [ ] Login as existing Google user
- [ ] Go to Settings → Security
- [ ] Verify "Set Password" UI is shown (has_set_password should be false)
- [ ] Set password
- [ ] Verify UI changes to "Change Password"

### Test 3: Regular User
- [ ] Register with email/password
- [ ] Go to Settings → Security
- [ ] Verify "Change Password" UI is shown
- [ ] Change password successfully
- [ ] Logout and login with new password

### Test 4: Google User Changing Password
- [ ] Login as Google user who has already set password
- [ ] Go to Settings → Security
- [ ] Verify "Change Password" UI is shown
- [ ] Enter current password (the one they set)
- [ ] Enter new password
- [ ] Verify password change succeeds
- [ ] Logout and login with new password

---

## Files Modified

### Backend
- `backend/src/controllers/authController.js` - Set has_set_password flag
- `backend/src/controllers/faculty.controller.js` - Return has_set_password

### Frontend
- `frontend/src/pages/faculty/Settings.jsx` - Track has_set_password and refresh after setting

### Database
- `database/migrations/add_password_set_flag.sql` - Migration file
- `schema.sql` - Updated schema

---

## Summary

This enhancement provides a seamless transition for Google users:

1. **Initial state**: Google user sees "Set Password" UI
2. **After setting password**: UI automatically switches to "Change Password"
3. **Future visits**: Always see "Change Password" UI
4. **Can login with**: Both Google Sign-In and Email/Password

The `has_set_password` flag ensures the UI adapts to the user's authentication state, providing the appropriate password management interface at all times. 🎯
