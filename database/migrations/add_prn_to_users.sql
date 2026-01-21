-- Migration: Add PRN column to users table for Google Auth integration
-- Date: 2026-01-21

-- Add PRN column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS prn VARCHAR(50);

-- Add unique constraint on PRN (allowing NULL for existing users)
CREATE UNIQUE INDEX IF NOT EXISTS users_prn_unique 
ON users(prn) 
WHERE prn IS NOT NULL;

-- Add comment
COMMENT ON COLUMN users.prn IS 'Permanent Registration Number - required for faculty members';
