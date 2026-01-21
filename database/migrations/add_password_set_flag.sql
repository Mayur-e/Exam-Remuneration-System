-- Migration: Add has_set_password column to users table
-- This column tracks whether a Google user has set their own password
-- Once set, they should use the regular "Change Password" flow

ALTER TABLE users 
ADD COLUMN has_set_password BOOLEAN DEFAULT false;

-- Update existing users who don't have google_id (regular users) to true
UPDATE users 
SET has_set_password = true 
WHERE google_id IS NULL;

-- Add comment
COMMENT ON COLUMN users.has_set_password IS 'Indicates if user has set their own password (true for regular users, becomes true for Google users after they set password)';
