-- Update calculate_exam function to set examiner_amount = 0 for NON_TEACHING claims
-- This ensures NON_TEACHING claims only calculate staff amounts

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
  v_staff_row RECORD;
  v_role RECORD;
  v_claim_form_type VARCHAR(30);
BEGIN
  SELECT * INTO v_exam FROM exams WHERE id = p_exam_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Exam not found'; END IF;

  -- Get claim form type
  v_claim_form_type := v_exam.claim_form_type;

  SELECT * INTO v_rates FROM remuneration_rates WHERE exam_type = v_exam.exam_type;
  IF NOT FOUND THEN RAISE EXCEPTION 'Rates not found'; END IF;

  SELECT * INTO v_batch FROM batch_sizes WHERE program = v_exam.program;

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

  -- Only calculate examiner amount for TEACHING claims (TEACHING_INTERNAL or TEACHING_EXTERNAL)
  -- For NON_TEACHING, examiner_amount should be 0
  IF v_claim_form_type = 'NON_TEACHING' THEN
    v_examiner := 0;
    v_min := FALSE;
  ELSE
    -- Calculate examiner amount for teaching claims
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

  -- Calculate staff amounts (applies to all claim types)
  FOR v_staff_row IN SELECT * FROM exam_staff WHERE exam_id = p_exam_id LOOP
    SELECT * INTO v_role FROM staff_role_rates WHERE staff_role = v_staff_row.staff_role;
    IF FOUND THEN
      v_staff := v_staff +
        v_staff_row.count *
        (
          v_role.preparation_rate * v_staff_row.preparation_days +
          v_role.per_batch_rate * v_batches +
          v_role.cleaning_rate * v_staff_row.cleaning_days
        );
    END IF;
  END LOOP;

  -- Update remuneration_calculations
  -- Keep existing chairman_allowance and conveyance_amount (managed by Billing Incharge)
  INSERT INTO remuneration_calculations
  (exam_id, examiner_amount, staff_amount, total_amount, min_applied)
  VALUES
  (p_exam_id, v_examiner, v_staff, v_examiner + v_staff, v_min)
  ON CONFLICT (exam_id) DO UPDATE
  SET examiner_amount = EXCLUDED.examiner_amount,
      staff_amount = EXCLUDED.staff_amount,
      total_amount = EXCLUDED.total_amount + COALESCE(remuneration_calculations.chairman_allowance, 0) + COALESCE(remuneration_calculations.conveyance_amount, 0),
      min_applied = EXCLUDED.min_applied,
      updated_at = CURRENT_TIMESTAMP;

  UPDATE exam_staff SET batches = v_batches WHERE exam_id = p_exam_id;
END;
$$;
