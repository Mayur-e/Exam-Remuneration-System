-- Migration: Add exam_staff_members table for individual staff tracking
-- This replaces the aggregate exam_staff table

-- Step 1: Create new table for individual staff members
CREATE TABLE IF NOT EXISTS public.exam_staff_members (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL,
    staff_name VARCHAR(100) NOT NULL,
    staff_role VARCHAR(100) NOT NULL,
    preparation_days INTEGER DEFAULT 0,
    examination_days INTEGER DEFAULT 0,
    cleaning_days INTEGER DEFAULT 0,
    batches INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT exam_staff_members_exam_id_fkey 
        FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE,
    CONSTRAINT exam_staff_members_staff_role_fkey 
        FOREIGN KEY (staff_role) REFERENCES public.staff_role_rates(staff_role),
    CONSTRAINT exam_staff_members_preparation_days_check CHECK (preparation_days >= 0),
    CONSTRAINT exam_staff_members_examination_days_check CHECK (examination_days >= 0),
    CONSTRAINT exam_staff_members_cleaning_days_check CHECK (cleaning_days >= 0)
);

-- Step 2: Create index for performance
CREATE INDEX idx_exam_staff_members_exam_id ON public.exam_staff_members(exam_id);

-- Step 3: Update calculate_exam function to use new table
CREATE OR REPLACE FUNCTION public.calculate_exam(p_exam_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE
      v_exam RECORD;
      v_rates RECORD;
      v_batch RECORD;
      v_students INT;
      v_batch_size INT := 1;
      v_batches INT := 1;
      v_examiner NUMERIC := 0;
      v_staff NUMERIC := 0;
      v_min BOOLEAN := FALSE;
      v_staff_member RECORD;
      v_role RECORD;
      v_gross NUMERIC := 0;
      v_tds NUMERIC := 0;
      v_net NUMERIC := 0;
      v_chairman_allowance NUMERIC := 0;
      v_conveyance_amount NUMERIC := 0;
    BEGIN
      SELECT * INTO v_exam FROM exams WHERE id = p_exam_id;
      IF NOT FOUND THEN RAISE EXCEPTION 'Exam not found'; END IF;

      SELECT * INTO v_rates FROM remuneration_rates WHERE exam_type = v_exam.exam_type;
      IF NOT FOUND THEN RAISE EXCEPTION 'Rates not found'; END IF;

      SELECT * INTO v_batch FROM batch_sizes WHERE program = v_exam.program;

      -- 1. Calculate Examiner Amount (for TEACHING claims)
      IF v_exam.claim_form_type IN ('TEACHING_INTERNAL', 'TEACHING_EXTERNAL') THEN
        IF v_exam.exam_type = 'PR' THEN
          v_batch_size := COALESCE(v_batch.practical_size,1);
        ELSIF v_exam.exam_type = 'OR' THEN
          v_batch_size := COALESCE(v_batch.oral_size,1);
        ELSIF v_exam.exam_type = 'TW' THEN
          v_batch_size := COALESCE(v_batch.termwork_size,1);
        ELSE
          v_batch_size := COALESCE(v_batch.project_oral_size,1);
        END IF;

        v_students := v_exam.students_count;
        IF v_students > 0 THEN
          v_batches := CEIL(v_students::numeric / v_batch_size::numeric);
        END IF;

        IF v_exam.program IN ('BTECH','BVOC') THEN
          IF v_exam.level IN ('FY','SY') THEN
            v_examiner := v_students * COALESCE(v_rates.fy_sy_rate,0);
          ELSE
            v_examiner := v_students * COALESCE(v_rates.ty_final_rate,0);
          END IF;
        ELSE
          v_examiner := v_students * COALESCE(v_rates.mtech_mca_rate,0);
        END IF;

        IF v_examiner < v_rates.min_per_day THEN
          v_examiner := v_rates.min_per_day;
          v_min := TRUE;
        END IF;
      END IF;

      -- 2. Fetch Allowances (for TEACHING claims)
      SELECT chairman_allowance, conveyance_amount INTO v_chairman_allowance, v_conveyance_amount
      FROM remuneration_calculations WHERE exam_id = p_exam_id;

      v_chairman_allowance := COALESCE(v_chairman_allowance, 0);
      v_conveyance_amount := COALESCE(v_conveyance_amount, 0);

      -- 3. Calculate Staff Amount from exam_staff_members (NEW)
      FOR v_staff_member IN SELECT * FROM exam_staff_members WHERE exam_id = p_exam_id LOOP
        SELECT * INTO v_role FROM staff_role_rates WHERE staff_role = v_staff_member.staff_role;
        IF FOUND THEN
          -- Calculate batches if not set
          IF v_batches = 0 THEN
            v_batches := 1;
          END IF;
          
          v_staff := v_staff +
            (
              v_role.preparation_rate * v_staff_member.preparation_days +
              v_role.per_batch_rate * v_batches +
              v_role.cleaning_rate * v_staff_member.cleaning_days
            );
        END IF;
      END LOOP;

      -- 4. Final Totals
      v_gross := v_examiner + v_staff + v_chairman_allowance + v_conveyance_amount;
      v_tds := v_gross * 0.10; -- 10% TDS
      v_net := v_gross - v_tds;

      -- 5. Update/Insert
      INSERT INTO remuneration_calculations
      (exam_id, examiner_amount, staff_amount, chairman_allowance, conveyance_amount, total_amount, tds_amount, net_amount, min_applied)
      VALUES
      (p_exam_id, v_examiner, v_staff, v_chairman_allowance, v_conveyance_amount, v_gross, v_tds, v_net, v_min)
      ON CONFLICT (exam_id) DO UPDATE
      SET examiner_amount = EXCLUDED.examiner_amount,
          staff_amount = EXCLUDED.staff_amount,
          chairman_allowance = EXCLUDED.chairman_allowance,
          conveyance_amount = EXCLUDED.conveyance_amount,
          total_amount = EXCLUDED.total_amount,
          tds_amount = EXCLUDED.tds_amount,
          net_amount = EXCLUDED.net_amount,
          min_applied = EXCLUDED.min_applied,
          updated_at = CURRENT_TIMESTAMP;

      UPDATE exam_staff_members SET batches = v_batches WHERE exam_id = p_exam_id;
    END;
    $$;

-- Step 4: Migrate existing data from exam_staff to exam_staff_members (if any)
-- This creates individual entries based on count
DO $$
DECLARE
    staff_record RECORD;
    i INTEGER;
BEGIN
    FOR staff_record IN SELECT * FROM exam_staff LOOP
        FOR i IN 1..staff_record.count LOOP
            INSERT INTO exam_staff_members 
            (exam_id, staff_name, staff_role, preparation_days, examination_days, cleaning_days, batches)
            VALUES 
            (staff_record.exam_id, 
             staff_record.staff_role || ' Member ' || i, 
             staff_record.staff_role, 
             staff_record.preparation_days, 
             0, -- examination_days not in old table
             staff_record.cleaning_days, 
             staff_record.batches);
        END LOOP;
    END LOOP;
END $$;

-- Step 5: Drop old exam_staff table (OPTIONAL - comment out if you want to keep it)
-- DROP TABLE IF EXISTS public.exam_staff CASCADE;

COMMENT ON TABLE public.exam_staff_members IS 'Individual staff members assigned to exams for non-teaching claims';
