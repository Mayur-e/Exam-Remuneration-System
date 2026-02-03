-- Fix primary key constraints to support multiple years
-- This migration properly handles foreign key dependencies

-- 1. Drop foreign key constraint from exam_staff_members if it exists
ALTER TABLE exam_staff_members DROP CONSTRAINT IF EXISTS exam_staff_members_staff_role_fkey;

-- 2. Drop and recreate primary key for remuneration_rates
ALTER TABLE remuneration_rates DROP CONSTRAINT IF EXISTS remuneration_rates_pkey CASCADE;
ALTER TABLE remuneration_rates ADD PRIMARY KEY (exam_type, academic_year);

-- 3. Drop and recreate primary key for staff_role_rates
ALTER TABLE staff_role_rates DROP CONSTRAINT IF EXISTS staff_role_rates_pkey CASCADE;
ALTER TABLE staff_role_rates ADD PRIMARY KEY (staff_role, academic_year);

-- 4. Drop and recreate primary key for batch_sizes
ALTER TABLE batch_sizes DROP CONSTRAINT IF EXISTS batch_sizes_pkey CASCADE;
ALTER TABLE batch_sizes ADD PRIMARY KEY (program, academic_year);

-- 5. Recreate foreign key from exam_staff_members to staff_role_rates
-- Note: This FK now only references staff_role, not the full composite key
-- This is intentional - we want to allow any staff role regardless of year
ALTER TABLE exam_staff_members 
ADD CONSTRAINT exam_staff_members_staff_role_fkey 
FOREIGN KEY (staff_role) 
REFERENCES staff_role_rates(staff_role) 
ON DELETE RESTRICT;

COMMENT ON CONSTRAINT exam_staff_members_staff_role_fkey ON exam_staff_members 
IS 'References staff_role only, not year-specific. Staff members can use any year''s role definition.';
