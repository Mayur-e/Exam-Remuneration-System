# Google Authentication Setup Guide

This guide explains how to set up Google Authentication for the Exam Remuneration System.

## Prerequisites

1. A Google Cloud Console account
2. Access to the project's backend and frontend `.env` files

## Step 1: Create Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: Internal (for organization) or External
   - App name: Exam Remuneration System
   - User support email: Your email
   - Authorized domains: `pccoepune.org`
6. For Application type, select **Web application**
7. Add Authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production URL (when deploying)
8. Add Authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - Your production URL (when deploying)
9. Click **Create**
10. Copy the **Client ID** (it will look like: `xxxxx.apps.googleusercontent.com`)

## Step 2: Configure Backend

1. Open `backend/.env`
2. Add or update the following line:
   ```
   GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
   ```

## Step 3: Configure Frontend

1. Open `frontend/.env`
2. Add or update the following line:
   ```
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
   ```

**Note:** Use the SAME Client ID for both backend and frontend.

## Step 4: Run Database Migration

Run the migration to add the `prn` column to the users table:

```bash
# Using psql
psql -U postgres -d ERMS -f database/migrations/add_prn_to_users.sql
```

Or connect to your database and run:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS prn VARCHAR(50);
CREATE UNIQUE INDEX IF NOT EXISTS users_prn_unique ON users(prn) WHERE prn IS NOT NULL;
```

## Step 5: Restart Development Servers

After updating the `.env` files:

```bash
# Backend (in backend directory)
npm run dev

# Frontend (in frontend directory)
npm run dev
```

## How It Works

### For New Users (First-time Google Sign-In):
1. User clicks "Sign in with Google"
2. Google authentication popup appears
3. User selects their `@pccoepune.org` account
4. A modal appears asking for:
   - PRN (Permanent Registration Number)
   - Department
5. User submits the form
6. Account is created with role `FACULTY`
7. User is redirected to dashboard
8. Toast notification appears: "Please complete your bank account details in the Settings tab"

### For Existing Users:
1. User clicks "Sign in with Google"
2. Google authentication popup appears
3. User selects their `@pccoepune.org` account
4. User is immediately logged in and redirected to dashboard

## Security Notes

- Only `@pccoepune.org` email addresses are allowed
- PRN must be unique across all users
- Google tokens are verified on the backend using `google-auth-library`
- Users created via Google Auth have a random secure password (they won't use it)

## Troubleshooting

### "Google Client ID is undefined"
- Make sure you've added `VITE_GOOGLE_CLIENT_ID` to `frontend/.env`
- Restart the frontend dev server after adding the variable

### "Invalid Google token"
- Verify the Client ID matches in both backend and frontend
- Check that the Client ID is correctly configured in Google Cloud Console

### "Only @pccoepune.org email addresses are allowed"
- This is intentional. Only college email addresses can register
- Make sure you're using a Google account with `@pccoepune.org` domain

### PRN already exists
- Each PRN can only be registered once
- Contact admin if you believe this is an error

## Testing

1. **Test New User Flow:**
   - Use a new `@pccoepune.org` Google account
   - Click "Sign in with Google"
   - Complete PRN and Department
   - Verify account creation in database
   - Check toast notification appears

2. **Test Existing User Flow:**
   - Use the same Google account again
   - Click "Sign in with Google"
   - Verify immediate login without PRN modal

3. **Test Email Domain Restriction:**
   - Try with a non-`@pccoepune.org` account
   - Verify error message appears
