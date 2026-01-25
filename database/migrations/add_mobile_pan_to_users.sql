-- Migration: Add mobile and PAN card fields to users table
-- This adds identity fields needed for the PDF claim form

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS mobile VARCHAR(15),
ADD COLUMN IF NOT EXISTS pan_card VARCHAR(20);

-- Add comments
COMMENT ON COLUMN users.mobile IS 'Mobile number of the user';
COMMENT ON COLUMN users.pan_card IS 'PAN card number of the user';
