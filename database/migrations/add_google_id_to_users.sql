-- Migration: Add google_id column to users table
-- This column will store the Google user ID for users who signed up with Google
-- It helps identify Google users and manage their authentication method

ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) DEFAULT NULL;

-- Add index for faster lookups
CREATE INDEX idx_users_google_id ON users(google_id);

-- Add comment
COMMENT ON COLUMN users.google_id IS 'Google user ID for users who signed up with Google OAuth';
