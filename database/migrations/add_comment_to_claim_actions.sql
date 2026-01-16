-- Add comment column to claim_actions table for storing rejection reasons

ALTER TABLE claim_actions 
ADD COLUMN IF NOT EXISTS comment TEXT;
