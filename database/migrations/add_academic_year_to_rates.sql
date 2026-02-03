-- Add academic_year column to rate tables for year-specific rate management
-- This allows administrators to configure different rates for different academic years

-- 1. Add academic_year to remuneration_rates
ALTER TABLE remuneration_rates 
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) NOT NULL DEFAULT '2024-25';

-- 2. Add academic_year to staff_role_rates
ALTER TABLE staff_role_rates 
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) NOT NULL DEFAULT '2024-25';

-- 3. Add academic_year to batch_sizes
ALTER TABLE batch_sizes 
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) NOT NULL DEFAULT '2024-25';

-- 4. Drop old unique constraints if they exist
ALTER TABLE remuneration_rates DROP CONSTRAINT IF EXISTS remuneration_rates_exam_type_key;
ALTER TABLE staff_role_rates DROP CONSTRAINT IF EXISTS staff_role_rates_staff_role_key;
ALTER TABLE batch_sizes DROP CONSTRAINT IF EXISTS batch_sizes_program_key;

-- 5. Add new unique constraints with academic_year
ALTER TABLE remuneration_rates 
ADD CONSTRAINT remuneration_rates_exam_type_year_key 
UNIQUE (exam_type, academic_year);

ALTER TABLE staff_role_rates 
ADD CONSTRAINT staff_role_rates_role_year_key 
UNIQUE (staff_role, academic_year);

ALTER TABLE batch_sizes 
ADD CONSTRAINT batch_sizes_program_year_key 
UNIQUE (program, academic_year);

-- 6. Create index for faster year-based queries
CREATE INDEX IF NOT EXISTS idx_remuneration_rates_year ON remuneration_rates(academic_year);
CREATE INDEX IF NOT EXISTS idx_staff_role_rates_year ON staff_role_rates(academic_year);
CREATE INDEX IF NOT EXISTS idx_batch_sizes_year ON batch_sizes(academic_year);

COMMENT ON COLUMN remuneration_rates.academic_year IS 'Academic year for these rates (e.g., 2024-25)';
COMMENT ON COLUMN staff_role_rates.academic_year IS 'Academic year for these rates (e.g., 2024-25)';
COMMENT ON COLUMN batch_sizes.academic_year IS 'Academic year for these batch sizes (e.g., 2024-25)';
