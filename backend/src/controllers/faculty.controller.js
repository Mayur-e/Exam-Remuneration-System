const pool = require("../config/db");
const crypto = require("crypto");

/**
 * Create Exam (Form selection + common header)
 */
exports.createExam = async (req, res) => {
  const {
    claim_form_type,
    exam_type,
    program,
    level,
    students_count,
    subject_name,
    subject_code,
    semester,
    academic_year,
    exam_date,
    is_backlog,
    second_examiner,
    prep_dates,
    exam_dates,
    cleaning_dates,
    students_per_batch,
    course_id
  } = req.body;

  if (
    !claim_form_type ||
    !['TEACHING_INTERNAL', 'TEACHING_EXTERNAL', 'NON_TEACHING'].includes(claim_form_type)
  ) {
    return res.status(400).json({
      message: "Invalid claim form type",
    });
  }
  // ðŸ”’ HARD VALIDATION
  if (
    !exam_type ||
    !program ||
    students_count === undefined ||
    students_count === null ||
    Number.isNaN(Number(students_count))
  ) {
    return res.status(400).json({
      message: "Invalid or missing exam details",
    });
  }

  const safeStudentsCount = Number(students_count);

  if (safeStudentsCount <= 0) {
    return res.status(400).json({
      message: "Students count must be greater than zero",
    });
  }



  // VALIDATION: Course must exist if provided (and it should be for coordination)
  if (course_id) {
    const courseCheck = await pool.query(
      `SELECT code, name FROM courses WHERE id = $1`,
      [course_id]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(400).json({
        message: "Selected course not found."
      });
    }
    // Auto-populate subject details from course if not provided?
    // User might validly provide them, but consistency is good.
    if (!subject_code) subject_code = courseCheck.rows[0].code;
    if (!subject_name) subject_name = courseCheck.rows[0].name;
  }

  // VALIDATION: Subject must exist in subjects table if provided
  if (subject_code || subject_name) {
    const subjectCheck = await pool.query(
      `SELECT 1 FROM subjects WHERE code = $1 OR name = $2 LIMIT 1`,
      [subject_code || '', subject_name || '']
    );

    // If generic subject check fails, it's fine if we have a valid course_id? 
    // Actually, systems might be separate. Let's keep subject validation for backward compat if needed, 
    // but honestly blindly trusting course_id is better for the new flow.
    // For now, let's allow if course_id is present.
  }

  // VALIDATION: Check student count against registered limit
  if (subject_code && academic_year && semester) {
    // Get the registered count for this subject/semester combination
    const registeredCountResult = await pool.query(
      `SELECT registered_count FROM subject_semester_counts 
       WHERE subject_code = $1 AND academic_year = $2 AND semester = $3`,
      [subject_code, academic_year, semester]
    );

    if (registeredCountResult.rows.length > 0) {
      const registeredCount = registeredCountResult.rows[0].registered_count;

      // Calculate total claimed students for this subject/semester/exam_type (excluding rejected claims)
      const existingClaimsResult = await pool.query(
        `SELECT COALESCE(SUM(students_count), 0) as total_claimed
         FROM exams
         WHERE subject_code = $1 
           AND academic_year = $2 
           AND semester = $3
           AND exam_type = $4
           AND status != 'rejected'`,
        [subject_code, academic_year, semester, exam_type]
      );

      const totalClaimed = parseInt(existingClaimsResult.rows[0].total_claimed);
      const availableSlots = registeredCount - totalClaimed;

      if (availableSlots <= 0) {
        return res.status(400).json({
          message: `Student limit reached for ${subject_code} (Sem ${semester}). Registered limit: ${registeredCount}, Already claimed: ${totalClaimed}.`
        });
      }

      if (safeStudentsCount > availableSlots) {
        return res.status(400).json({
          message: `Only ${availableSlots} student slot(s) available for ${subject_code} (Sem ${semester}). Please reduce count.`
        });
      }
    }
  }


  // ✅ Now safe to insert
  const result = await pool.query(
    `
    INSERT INTO exams
    (faculty_id, claim_form_type, exam_type, program, level, students_count,
     subject_name, subject_code, semester, academic_year, exam_date, is_backlog, second_examiner,
     prep_dates, exam_dates, cleaning_dates, students_per_batch, course_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
    RETURNING id
    `,
    [
      req.user.id,
      claim_form_type,
      exam_type,
      program,
      level || null,
      safeStudentsCount,
      subject_name || null,
      subject_code || null,
      semester || null,
      academic_year || null,
      exam_date || null,
      Boolean(is_backlog) || false,
      second_examiner || null,
      prep_dates || null,
      exam_dates || null,
      cleaning_dates || null,
      students_per_batch ? Number(students_per_batch) : null,
      course_id || null
    ]
  );

  const { id } = result.rows[0];

  // AUTO-CREATE Expert Assistant for NON_TEACHING claims
  // The internal faculty is automatically the Expert Assistant
  if (claim_form_type === 'NON_TEACHING') {
    try {
      // Get Expert Assistant rate (use latest academic year)
      const rateResult = await pool.query(
        `SELECT per_batch_rate 
         FROM staff_role_rates 
         WHERE staff_role = 'Expert Assistant' 
         ORDER BY academic_year DESC 
         LIMIT 1`
      );

      if (rateResult.rows.length > 0) {
        const expertRate = rateResult.rows[0].per_batch_rate || 0;

        // For non-teaching, examination_dates = exam_date (they're the same)
        const examinationDays = exam_date ? 1 : 0;

        // Get faculty name
        const facultyResult = await pool.query(
          `SELECT name FROM users WHERE id = $1`,
          [req.user.id]
        );

        const facultyName = facultyResult.rows[0]?.name || 'Internal Faculty';

        // Create Expert Assistant entry automatically
        await pool.query(
          `INSERT INTO exam_staff_members 
           (exam_id, staff_role, staff_name, is_internal, preparation_days, examination_days, cleaning_days, rate, batches)
           VALUES ($1, 'Expert Assistant', $2, true, 0, $3, 0, $4, 0)
           ON CONFLICT ON CONSTRAINT unique_staff_per_exam DO NOTHING`,
          [id, facultyName, examinationDays, expertRate]
        );
      }
    } catch (error) {
      console.error('Failed to auto-create Expert Assistant:', error);
      // Don't fail the exam creation if Expert Assistant creation fails
    }
  }

  return res.status(201).json({ id });

};

/**
 * Update Exam
 */
exports.updateExam = async (req, res) => {
  const examId = req.params.id;
  const {
    claim_form_type,
    exam_type,
    program,
    level,
    students_count,
    subject_name,
    subject_code,
    semester,
    academic_year,
    exam_date,
    is_backlog,
    second_examiner,
    prep_dates,
    exam_dates,
    cleaning_dates,
    students_per_batch,
    course_id
  } = req.body;

  try {
    // Verify exam exists and belongs to faculty
    const examCheck = await pool.query(
      `SELECT id, status FROM exams WHERE id=$1 AND faculty_id=$2`,
      [examId, req.user.id]
    );

    if (examCheck.rows.length === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const currentExam = examCheck.rows[0];
    if (currentExam.status !== "draft" && currentExam.status !== "rejected") {
      return res.status(400).json({ message: "Cannot modify submitted claim" });
    }

    // VALIDATION: Subject must exist in subjects table if provided
    if (subject_code || subject_name) {
      const subjectCheck = await pool.query(
        `SELECT 1 FROM subjects WHERE code = $1 OR name = $2 LIMIT 1`,
        [subject_code || '', subject_name || '']
      );

      if (subjectCheck.rows.length === 0) {
        return res.status(400).json({
          message: `Subject "${subject_code || subject_name}" not found in master subjects list. Please select a valid subject from the dropdown.`
        });
      }
    }

    // VALIDATION: Check student count against registered limit
    if (subject_code && academic_year && semester && students_count) {
      // Get the registered count for this subject/semester combination
      const registeredCountResult = await pool.query(
        `SELECT registered_count FROM subject_semester_counts 
         WHERE subject_code = $1 AND academic_year = $2 AND semester = $3`,
        [subject_code, academic_year, semester]
      );

      if (registeredCountResult.rows.length > 0) {
        const registeredCount = registeredCountResult.rows[0].registered_count;

        // Calculate total claimed students for this subject/semester/exam_type (excluding rejected claims and THIS exam)
        const existingClaimsResult = await pool.query(
          `SELECT COALESCE(SUM(students_count), 0) as total_claimed
           FROM exams
           WHERE subject_code = $1 
             AND academic_year = $2 
             AND semester = $3
             AND exam_type = $4
             AND status != 'rejected'
             AND id != $5`,
          [subject_code, academic_year, semester, exam_type, examId]
        );

        const totalClaimed = parseInt(existingClaimsResult.rows[0].total_claimed);
        const availableSlots = registeredCount - totalClaimed;

        if (availableSlots <= 0) {
          return res.status(400).json({
            message: `Student limit reached for ${subject_code} (Sem ${semester}). Registered limit: ${registeredCount}, Already claimed: ${totalClaimed}.`
          });
        }

        if (Number(students_count) > availableSlots) {
          return res.status(400).json({
            message: `Only ${availableSlots} student slot(s) available for ${subject_code} (Sem ${semester}). Please reduce count.`
          });
        }
      }
    }

    // For NON_TEACHING claims: examination_dates = exam_date (they're the same)
    let finalExamDates = exam_dates;
    if (claim_form_type === 'NON_TEACHING' && exam_date) {
      // Automatically set exam_dates to exam_date for non-teaching
      finalExamDates = exam_date;
    }

    // Date validation for NON_TEACHING claims
    if (claim_form_type === 'NON_TEACHING' && finalExamDates) {
      const prepDatesArr = prep_dates ? prep_dates.split(",").map(d => d.trim()).filter(Boolean) : [];
      const examDatesArr = finalExamDates.split(",").map(d => d.trim()).filter(Boolean);
      const cleanDatesArr = cleaning_dates ? cleaning_dates.split(",").map(d => d.trim()).filter(Boolean) : [];

      if (examDatesArr.length === 0) {
        return res.status(400).json({ message: "At least one examination date is required" });
      }

      const minExamDate = new Date(Math.min(...examDatesArr.map(d => new Date(d))));
      const maxExamDate = new Date(Math.max(...examDatesArr.map(d => new Date(d))));

      // Rule 1: Prep dates must be before exam dates
      for (const prepDate of prepDatesArr) {
        if (new Date(prepDate) >= minExamDate) {
          return res.status(400).json({
            message: `Preparation date ${prepDate} must be before the earliest exam date`
          });
        }
      }

      // Rule 2: Cleaning dates must be on or after exam dates
      for (const cleanDate of cleanDatesArr) {
        if (new Date(cleanDate) < maxExamDate) {
          return res.status(400).json({
            message: `Cleaning date ${cleanDate} must be on or after the latest exam date`
          });
        }
      }
    }

    // Update exam
    await pool.query(
      `UPDATE exams SET
        claim_form_type = $1,
        exam_type = $2,
        program = $3,
        level = $4,
        students_count = $5,
        subject_name = $6,
        subject_code = $7,
        semester = $8,
        academic_year = $9,
        exam_date = $10,
        is_backlog = $11,
        second_examiner = $12,
        prep_dates = $13,
        exam_dates = $14,
        cleaning_dates = $15,
        students_per_batch = $16,
        course_id = $17,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $18 AND faculty_id = $19`,
      [
        claim_form_type,
        exam_type,
        program,
        level || null,
        students_count,
        subject_name || null,
        subject_code || null,
        semester || null,
        academic_year || null,
        exam_date || null,
        Boolean(is_backlog) || false,
        second_examiner || null,
        prep_dates || null,
        finalExamDates || null,  // Use finalExamDates instead of exam_dates
        cleaning_dates || null,
        students_per_batch ? Number(students_per_batch) : null,
        course_id || null,
        examId,
        req.user.id
      ]
    );

    return res.json({ message: "Exam updated successfully" });
  } catch (error) {
    console.error("Update exam error:", error);
    return res.status(500).json({ message: "Failed to update exam" });
  }
};

/**
 * Add Exam Staff Member (NON_TEACHING form)
 */
exports.addExamStaff = async (req, res) => {
  const examId = req.params.id;
  const { staff_name, staff_role, rate, preparation_days, examination_days, cleaning_days } = req.body;

  // Validation
  if (!staff_name || !staff_role) {
    return res.status(400).json({ message: "Staff name and role are required" });
  }

  // Verify exam exists and belongs to faculty
  const exam = await pool.query(
    `SELECT id, exam_type, students_count, status, is_backlog FROM exams WHERE id=$1 AND faculty_id=$2`,
    [examId, req.user.id]
  );

  if (exam.rows.length === 0) {
    return res.status(404).json({ message: "Exam not found" });
  }

  if (exam.rows[0].status !== "draft") {
    return res.status(400).json({ message: "Cannot modify submitted claim" });
  }

  // Verify staff role exists
  const roleCheck = await pool.query(
    `SELECT staff_role FROM staff_role_rates WHERE staff_role=$1`,
    [staff_role]
  );

  if (roleCheck.rows.length === 0) {
    return res.status(400).json({ message: "Invalid staff role" });
  }

  const examData = exam.rows[0];
  const studentCount = examData.students_count;
  const examType = examData.exam_type;
  const examCategory = examData.is_backlog ? 'BACKLOG' : 'REGULAR';

  // RULE: Expert Assistants cannot claim preparation or cleaning days
  if (staff_role === "Expert Assistant") {
    if ((preparation_days && preparation_days > 0) || (cleaning_days && cleaning_days > 0)) {
      return res.status(400).json({
        message: "Expert Assistants are not entitled to claim preparation or cleaning day remuneration"
      });
    }
  }

  // Fetch norms from database
  const norms = await pool.query(
    `SELECT * FROM exam_staff_norms 
     WHERE exam_type = $1 
     AND exam_category = $2 
     AND min_students <= $3 
     AND (max_students IS NULL OR max_students >= $3)
     ORDER BY min_students DESC
     LIMIT 1`,
    [examType, examCategory, studentCount]
  );

  if (norms.rows.length === 0) {
    return res.status(400).json({
      message: `No staff norms defined for ${examType} (${examCategory}) with ${studentCount} students`
    });
  }

  const norm = norms.rows[0];

  // Map staff role to norm column
  const roleToColumnMap = {
    "Expert Assistant": "max_expert_assistants",
    "Laboratory/Technical Assistant": "max_lab_assistants",
    "Foreman": "max_foreman",
    "Peon": "max_peon"
  };

  const normColumn = roleToColumnMap[staff_role];
  if (!normColumn) {
    return res.status(400).json({ message: "Invalid staff role" });
  }

  const maxAllowed = norm[normColumn];

  // Count current staff of this role
  const currentCount = await pool.query(
    `SELECT COUNT(*) as count FROM exam_staff_members 
     WHERE exam_id=$1 AND staff_role=$2`,
    [examId, staff_role]
  );

  const existingCount = parseInt(currentCount.rows[0].count);

  if (existingCount >= maxAllowed) {
    return res.status(400).json({
      message: `Maximum ${maxAllowed} ${staff_role}(s) allowed for ${examCategory} ${examType} exam with ${studentCount} students`
    });
  }

  // Validate preparation and cleaning days against norms
  const prepDays = parseInt(preparation_days) || 0;
  const cleanDays = parseInt(cleaning_days) || 0;

  if (prepDays > norm.max_preparation_days) {
    return res.status(400).json({
      message: `Maximum ${norm.max_preparation_days} preparation day(s) allowed for this exam type`
    });
  }

  if (cleanDays > norm.max_cleaning_days) {
    return res.status(400).json({
      message: `Maximum ${norm.max_cleaning_days} cleaning day(s) allowed for this exam type`
    });
  }

  // Insert staff member
  await pool.query(
    `
    INSERT INTO exam_staff_members (
      exam_id,
      staff_name,
      staff_role,
      rate,
      preparation_days,
      examination_days,
      cleaning_days
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
    [
      examId,
      staff_name,
      staff_role,
      rate ? Number(rate) : 0,
      prepDays,
      examination_days || 0,
      cleanDays
    ]
  );

  return res.json({ message: "Staff member added successfully" });
};


/**
 * Submit Exam (Triggers calculation)
 */
exports.submitExam = async (req, res) => {
  const examId = req.params.id;

  try {
    // 1. Fetch exam details with all required fields
    const examResult = await pool.query(
      `
      SELECT e.id, e.claim_form_type, e.subject_code, e.exam_type, e.faculty_id
      FROM exams e
      WHERE e.id=$1 AND e.faculty_id=$2
      `,
      [examId, req.user.id]
    );

    if (examResult.rows.length === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const exam = examResult.rows[0];

    // 2. Block external claims
    if (exam.claim_form_type === 'TEACHING_EXTERNAL') {
      return res.status(400).json({
        message: "External claims must be submitted by external examiner"
      });
    }

    // 3. VALIDATION: Subject must exist in subjects table
    if (exam.subject_code) {
      const subjectCheck = await pool.query(
        `SELECT 1 FROM subjects WHERE code = $1 LIMIT 1`,
        [exam.subject_code]
      );

      if (subjectCheck.rows.length === 0) {
        return res.status(400).json({
          message: `Subject code "${exam.subject_code}" not found in master subjects list. Please select a valid subject.`
        });
      }
    }

    // 4. VALIDATION: For Teaching claims, verify remuneration rates exist
    if (exam.claim_form_type === 'TEACHING_INTERNAL') {
      const rateCheck = await pool.query(
        `SELECT 1 FROM remuneration_rates WHERE exam_type = $1 LIMIT 1`,
        [exam.exam_type]
      );

      if (rateCheck.rows.length === 0) {
        return res.status(400).json({
          message: `Remuneration rates not configured for exam type "${exam.exam_type}". Please contact administrator.`
        });
      }
    }

    // 5. AUTO-CREATE Expert Assistant for Non-Teaching claims
    // For NON_TEACHING claims, the internal faculty is the Expert Assistant
    if (exam.claim_form_type === 'NON_TEACHING') {
      // Check if Expert Assistant entry already exists for this faculty
      const expertCheck = await pool.query(
        `SELECT id FROM exam_staff_members 
         WHERE exam_id = $1 AND staff_role = 'Expert Assistant' AND is_internal = true`,
        [examId]
      );

      // If no Expert Assistant exists, create one for the internal faculty
      if (expertCheck.rows.length === 0) {
        // Get Expert Assistant rate (use latest academic year)
        const rateResult = await pool.query(
          `SELECT preparation_rate, per_batch_rate, cleaning_rate 
           FROM staff_role_rates 
           WHERE staff_role = 'Expert Assistant' 
           ORDER BY academic_year DESC 
           LIMIT 1`
        );

        if (rateResult.rows.length === 0) {
          return res.status(400).json({
            message: "Expert Assistant rate not configured. Please contact administrator."
          });
        }

        // For Expert Assistant, use per_batch_rate as the examination rate
        const expertRate = rateResult.rows[0].per_batch_rate || 0;

        // Get exam_date to calculate examination days
        const examDateResult = await pool.query(
          `SELECT exam_date FROM exams WHERE id = $1`,
          [examId]
        );

        const examDate = examDateResult.rows[0].exam_date;
        const examinationDays = examDate ? 1 : 0; // For non-teaching, exam date = 1 examination day

        // Get faculty name
        const facultyResult = await pool.query(
          `SELECT name FROM users WHERE id = $1`,
          [exam.faculty_id]
        );

        const facultyName = facultyResult.rows[0].name;

        // Create Expert Assistant entry (use ON CONFLICT to handle duplicates)
        await pool.query(
          `INSERT INTO exam_staff_members 
           (exam_id, staff_role, staff_name, is_internal, preparation_days, examination_days, cleaning_days, rate, batches)
           VALUES ($1, 'Expert Assistant', $2, true, 0, $3, 0, $4, 0)
           ON CONFLICT ON CONSTRAINT unique_staff_per_exam DO NOTHING`,
          [examId, facultyName, examinationDays, expertRate]
        );
      }

      // Now check if there are any staff members (including the auto-created Expert Assistant)
      const staffCheck = await pool.query(
        `SELECT COUNT(*) as count FROM exam_staff_members WHERE exam_id = $1`,
        [examId]
      );

      const staffCount = parseInt(staffCheck.rows[0].count);
      if (staffCount === 0) {
        return res.status(400).json({
          message: "Please add at least one staff member before submitting non-teaching claim."
        });
      }
    }

    // 6. VALIDATION: Faculty must have bank details
    const bankCheck = await pool.query(
      `SELECT bank_name, account_number, ifsc_code 
       FROM faculty_bank_accounts 
       WHERE faculty_id = $1`,
      [req.user.id]
    );

    if (bankCheck.rows.length === 0) {
      return res.status(400).json({
        message: "Please add your bank details in profile settings before submitting a claim."
      });
    }

    const bankDetails = bankCheck.rows[0];
    if (!bankDetails.bank_name || !bankDetails.account_number || !bankDetails.ifsc_code) {
      return res.status(400).json({
        message: "Please ensure your bank details (Bank Name, Account Number, IFSC) are complete in profile settings."
      });
    }

    // 7. Lock exam as submitted
    // NON_TEACHING claims bypass course coordinator review
    const newStatus = exam.claim_form_type === 'NON_TEACHING'
      ? 'SENT_TO_BILLING'
      : 'UNDER_COORDINATOR_REVIEW';

    await pool.query(
      `UPDATE exams SET status=$1, updated_at=NOW() WHERE id=$2`,
      [newStatus, examId]
    );

    // 8. Initialize remuneration calculations
    await pool.query(
      `INSERT INTO remuneration_calculations (exam_id, chairman_allowance, conveyance_amount)
       VALUES ($1, 0, 0)
       ON CONFLICT (exam_id) DO NOTHING`,
      [examId]
    );

    // 9. Trigger calculation
    await pool.query(`SELECT calculate_exam($1)`, [examId]);

    return res.json({ message: "Claim submitted and calculated successfully" });
  } catch (error) {
    console.error("Submit exam error:", error);
    return res.status(500).json({
      message: "Failed to submit claim. Please try again."
    });
  }
};


/**
 * List Facultyâ€™s Own Exams
 */
exports.listMyExams = async (req, res) => {
  try {
    const result = await pool.query(
      `
    SELECT
      e.id,
      e.exam_type,
      e.subject_name,
      e.subject_code,
      e.status,
      e.claim_form_type,
      e.program,
      e.level,
      eel.token as external_link_token,
      r.total_amount
    FROM exams e
    LEFT JOIN remuneration_calculations r ON r.exam_id = e.id
    LEFT JOIN external_exam_links eel ON eel.exam_id = e.id
    WHERE e.faculty_id = $1
    ORDER BY e.created_at DESC
    `,
      [req.user.id]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("listMyExams error:", error);
    return res.status(500).json({ message: "Failed to fetch claims" });
  }
};

/**
 * Get Full Exam Details (Preview)
 */
exports.getExamDetails = async (req, res) => {
  const examId = req.params.id;

  const exam = await pool.query(
    `SELECT * FROM exams WHERE id = $1 AND faculty_id = $2`,
    [examId, req.user.id]
  );

  if (exam.rowCount === 0) {
    return res.status(404).json({ message: "Exam not found" });
  }

  const staff = await pool.query(
    `SELECT * FROM exam_staff WHERE exam_id = $1`,
    [examId]
  );

  const calculation = await pool.query(
    `SELECT * FROM remuneration_calculations WHERE exam_id = $1`,
    [examId]
  );

  // Get rejection and sent-back history if any
  const claimActions = await pool.query(
    `SELECT ca.comment, ca.action_at, ca.action_type, u.name AS action_by_name
     FROM claim_actions ca
     JOIN users u ON ca.action_by = u.id
     WHERE ca.exam_id = $1 AND ca.action_type IN ('REJECTED', 'SENT_BACK')
     ORDER BY ca.action_at DESC`,
    [examId]
  );

  return res.json({
    exam: exam.rows[0],
    staff: staff.rows,
    calculation: calculation.rows[0] || null,
    claimActions: claimActions.rows
  });
};

exports.dashboardStats = async (req, res) => {
  const facultyId = req.user.id;

  const { rows } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
      COUNT(*) FILTER (WHERE status IN ('submitted', 'UNDER_COORDINATOR_REVIEW', 'COORDINATOR_VERIFIED', 'SENT_TO_BILLING')) AS pending_count,
      COUNT(*) FILTER (WHERE status IN ('rejected', 'COORDINATOR_REJECTED')) AS rejected_count,
      COALESCE(SUM(rc.net_amount) FILTER (WHERE status != 'paid'), 0) AS total_amount
    FROM exams e
    LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id
    WHERE e.faculty_id = $1
  `, [facultyId]);

  return res.json(rows[0]);
};


/* ==============================
   GET PROFILE (SETTINGS)
================================ */
exports.getProfile = async (req, res) => {
  try {
    const user = await pool.query(
      `
      SELECT id, name, email, department
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    return res.json(user.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load profile" });
  }
};

/* ==============================
   UPDATE PROFILE (SETTINGS)
================================ */
exports.updateProfile = async (req, res) => {
  try {
    const { name, department } = req.body;

    await pool.query(
      `
      UPDATE users
      SET name = $1,
          department = $2
      WHERE id = $3
      `,
      [name, department, req.user.id]
    );

    return res.json({ message: "Profile updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

exports.getExamSummary = async (req, res) => {
  const examId = req.params.id;

  const result = await pool.query(
    `SELECT 
        e.id AS exam_id,
        e.exam_type,
        e.program,
        e.level,
        e.students_count,
        e.status,
        rc.examiner_amount,
        rc.staff_amount,
        rc.chairman_allowance,
        rc.conveyance_amount,
        rc.total_amount,
        rc.min_applied
     FROM exams e
     LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id
     WHERE e.id = $1 AND e.faculty_id = $2`,
    [examId, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Claim not found" });
  }

  return res.json(result.rows[0]);
};



/**
 * GET BILL SUMMARY
 */
exports.getBillSummary = async (req, res) => {
  const examId = req.params.id;

  const result = await pool.query(
    `
    SELECT
      e.claim_form_type,
      CASE
        WHEN e.claim_form_type = 'NON_TEACHING' THEN 0
        WHEN e.program IN ('BTECH','BVOC') AND e.level IN ('FY','SY')
          THEN e.students_count * rr.fy_sy_rate
        WHEN e.program IN ('BTECH','BVOC')
          THEN e.students_count * rr.ty_final_rate
        ELSE
          e.students_count * rr.mtech_mca_rate
      END AS examiner_amount_calculated,

      CASE
        WHEN e.claim_form_type = 'NON_TEACHING' THEN 0
        ELSE r.examiner_amount
      END AS examiner_amount,
      
      r.staff_amount,
      r.chairman_allowance,
      r.conveyance_amount,
      r.total_amount,
      r.tds_amount,
      r.net_amount,
      r.min_applied

    FROM remuneration_calculations r
    JOIN exams e ON e.id = r.exam_id
    LEFT JOIN remuneration_rates rr ON rr.exam_type = e.exam_type
    WHERE e.id = $1
      AND e.faculty_id = $2
    `,
    [examId, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Bill not generated yet" });
  }

  return res.json(result.rows[0]);
};



exports.getExamById = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT * FROM exams WHERE id=$1 AND faculty_id=$2`,
    [id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Exam not found" });
  }

  // Get claim actions (rejections and sent-back) if any
  const actions = await pool.query(
    `SELECT 
      ca.action_type,
      COALESCE(ca.remarks, ca.comment) as comment,
      ca.action_at,
      u.name AS action_by_name
     FROM claim_actions ca
     JOIN users u ON ca.action_by = u.id
     WHERE ca.exam_id = $1 
       AND (ca.action_type IN ('REJECTED', 'SENT_BACK', 'REJECT'))
     ORDER BY ca.action_at DESC`,
    [id]
  );

  return res.json({
    ...result.rows[0],
    claimActions: actions.rows
  });
};

exports.updateExam = async (req, res) => {
  const examId = req.params.id;

  const {
    exam_type,
    program,
    level,
    students_count,
    subject_name,
    subject_code,
    semester,
    academic_year,
    exam_date,
    is_backlog,
    second_examiner,
    prep_dates,
    exam_dates,
    cleaning_dates,
    students_per_batch
  } = req.body;

  // only draft or rejected allowed
  const check = await pool.query(
    `SELECT status FROM exams WHERE id=$1 AND faculty_id=$2`,
    [examId, req.user.id]
  );

  if (check.rows.length === 0)
    return res.status(404).json({ message: "Exam not found" });

  if (check.rows[0].status !== "draft" && check.rows[0].status !== "rejected")
    return res.status(400).json({ message: "Cannot edit submitted or approved claim" });

  await pool.query(
    `
    UPDATE exams SET
      exam_type=$1,
      program=$2,
      level=$3,
      students_count=$4,
      subject_name=$5,
      subject_code=$6,
      semester=$7,
      academic_year=$8,
      exam_date=$9,
      is_backlog=$10,
      second_examiner=$11,
      prep_dates=$12,
      exam_dates=$13,
      cleaning_dates=$14,
      students_per_batch=$15,
      updated_at=NOW()
    WHERE id=$16
    `,
    [
      exam_type,
      program,
      level,
      students_count,
      subject_name,
      subject_code,
      semester,
      academic_year,
      exam_date,
      is_backlog,
      second_examiner || null,
      prep_dates || null,
      exam_dates || null,
      cleaning_dates || null,
      students_per_batch ? Number(students_per_batch) : null,
      examId
    ]
  );

  res.json({ message: "Draft updated" });
};

exports.deleteDraft = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `
    DELETE FROM exams
    WHERE id=$1 AND faculty_id=$2 AND status='draft'
    `,
    [id, req.user.id]
  );

  if (result.rowCount === 0) {
    return res.status(403).json({ message: "Cannot delete this claim" });
  }

  res.json({ message: "Draft deleted" });
};


exports.listDraftClaims = async (req, res) => {
  const result = await pool.query(
    `
    SELECT id, exam_type, subject_name, claim_form_type, created_at
    FROM exams
    WHERE faculty_id=$1
      AND status='draft'
    ORDER BY created_at DESC
    `,
    [req.user.id]
  );

  res.json(result.rows);
};

exports.generateExternalLink = async (req, res) => {
  const examId = req.params.id;

  // 1. Validate exam
  const exam = await pool.query(
    `
    SELECT id, status
    FROM exams
    WHERE id=$1
      AND faculty_id=$2
      AND claim_form_type='TEACHING_EXTERNAL'
    `,
    [examId, req.user.id]
  );

  if (!exam.rows.length) {
    return res.status(400).json({ message: "Invalid external exam" });
  }

  if (exam.rows[0].status !== "draft" && exam.rows[0].status !== "rejected") {
    return res.status(400).json({
      message: "Cannot generate link after submission"
    });
  }

  // 2. Check for existing valid (non-expired, unused) link
  const existingLink = await pool.query(
    `
    SELECT token, expires_at
    FROM external_exam_links
    WHERE exam_id = $1
      AND used = false
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [examId]
  );

  // If valid link exists, return it
  if (existingLink.rows.length > 0) {
    const token = existingLink.rows[0].token;
    const expiresAt = existingLink.rows[0].expires_at;

    return res.json({
      link: `${process.env.FRONTEND_URL}/external/claim/${token}`,
      message: "Existing valid link returned",
      expiresAt: expiresAt,
      isExisting: true
    });
  }

  // 3. Revoke existing unused links (expired or otherwise)
  await pool.query(
    `
    UPDATE external_exam_links
    SET used = true
    WHERE exam_id = $1
      AND used = false
    `,
    [examId]
  );

  // 4. Generate fresh token
  const token = crypto.randomBytes(32).toString("hex");

  const newLink = await pool.query(
    `
    INSERT INTO external_exam_links (exam_id, token, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '7 days')
    RETURNING expires_at
    `,
    [examId, token]
  );

  res.json({
    link: `${process.env.FRONTEND_URL}/external/claim/${token}`,
    message: "New external link generated",
    expiresAt: newLink.rows[0].expires_at,
    isExisting: false
  });
};

/* ==============================
   GET PROFILE
================================ */
exports.getProfile = async (req, res) => {
  const facultyId = req.user.id;

  const user = await pool.query(
    `SELECT id, name, email, department, prn, mobile, pan_card, google_id, has_set_password, created_at FROM users WHERE id=$1`,
    [facultyId]
  );

  const bank = await pool.query(
    `SELECT account_holder_name, bank_name, branch_name, account_number, ifsc_code, account_type 
     FROM faculty_bank_accounts WHERE faculty_id=$1`,
    [facultyId]
  );

  res.json({
    ...user.rows[0],
    bank: bank.rows[0] || null
  });
};

/* ==============================
   UPDATE PROFILE
================================ */
exports.updateProfile = async (req, res) => {
  const facultyId = req.user.id;
  const { name, department, prn, mobile, pan_card, bank } = req.body;

  try {
    // Update user profile
    if (name || department || prn || mobile || pan_card) {
      const updates = [];
      const params = [];
      let paramIndex = 1;

      if (name) {
        updates.push(`name = $${paramIndex++}`);
        params.push(name);
      }
      if (department) {
        updates.push(`department = $${paramIndex++}`);
        params.push(department);
      }
      if (prn) {
        // Check if PRN is already taken by another user
        const prnCheck = await pool.query(
          `SELECT id FROM users WHERE prn = $1 AND id != $2`,
          [prn, facultyId]
        );

        if (prnCheck.rows.length > 0) {
          return res.status(409).json({ message: "PRN already exists" });
        }

        updates.push(`prn = $${paramIndex++}`);
        params.push(prn);
      }
      if (mobile) {
        updates.push(`mobile = $${paramIndex++}`);
        params.push(mobile);
      }
      if (pan_card) {
        updates.push(`pan_card = $${paramIndex++}`);
        params.push(pan_card);
      }

      if (updates.length > 0) {
        params.push(facultyId);
        await pool.query(
          `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
          params
        );
      }
    }

    // Update or insert bank details
    if (bank) {
      const { account_holder_name, bank_name, branch_name, account_number, ifsc_code, account_type } = bank;

      const existing = await pool.query(
        `SELECT id FROM faculty_bank_accounts WHERE faculty_id = $1`,
        [facultyId]
      );

      if (existing.rows.length > 0) {
        // Update existing
        await pool.query(
          `UPDATE faculty_bank_accounts 
           SET account_holder_name = $1, bank_name = $2, branch_name = $3, 
               account_number = $4, ifsc_code = $5, account_type = $6
           WHERE faculty_id = $7`,
          [account_holder_name, bank_name, branch_name, account_number, ifsc_code, account_type || 'Savings', facultyId]
        );
      } else {
        // Insert new
        await pool.query(
          `INSERT INTO faculty_bank_accounts 
           (faculty_id, account_holder_name, bank_name, branch_name, account_number, ifsc_code, account_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [facultyId, account_holder_name, bank_name, branch_name, account_number, ifsc_code, account_type || 'Savings']
        );
      }
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/* ==============================
   RESUBMIT REJECTED CLAIM
================================ */
exports.resubmitClaim = async (req, res) => {
  const examId = req.params.id;
  const facultyId = req.user.id;

  try {
    // Check if claim exists, belongs to faculty, and is rejected (either by Billing or Coordinator)
    const examResult = await pool.query(
      `SELECT id, status, claim_form_type FROM exams WHERE id = $1 AND faculty_id = $2`,
      [examId, facultyId]
    );

    if (examResult.rowCount === 0) {
      return res.status(404).json({ message: "Claim not found" });
    }

    const exam = examResult.rows[0];

    if (exam.status !== 'rejected' && exam.status !== 'COORDINATOR_REJECTED') {
      return res.status(400).json({ message: "Only rejected claims can be resubmitted" });
    }

    // Workflow logic: Re-route to coordinator unless it's a non-teaching claim that bypasses it
    const newStatus = exam.claim_form_type === 'NON_TEACHING'
      ? 'SENT_TO_BILLING'
      : 'UNDER_COORDINATOR_REVIEW';

    await pool.query('BEGIN');

    // Update status 
    await pool.query(
      `UPDATE exams SET status = $1, updated_at = NOW() WHERE id = $2`,
      [newStatus, examId]
    );

    // Log Action
    await pool.query(
      `INSERT INTO claim_actions (exam_id, action_by, action_role, action_type, remarks)
       VALUES ($1, $2, 'FACULTY', 'RESUBMIT', 'Claim resubmitted after correction')`,
      [examId, facultyId]
    );

    await pool.query('COMMIT');
    res.json({ message: "Claim resubmitted successfully" });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Resubmit claim error:", error);
    res.status(500).json({ message: "Failed to resubmit claim" });
  }
};

/**
 * Get Exam Staff Members
 */
exports.getExamStaff = async (req, res) => {
  const examId = req.params.id;

  // Verify exam belongs to faculty
  const exam = await pool.query(
    `SELECT id FROM exams WHERE id=$1 AND faculty_id=$2`,
    [examId, req.user.id]
  );

  if (exam.rows.length === 0) {
    return res.status(404).json({ message: "Exam not found" });
  }

  // Get staff members
  const staff = await pool.query(
    `SELECT * FROM exam_staff_members WHERE exam_id=$1 ORDER BY id`,
    [examId]
  );

  return res.json(staff.rows);
};

/**
 * Update Exam Staff Member
 */
exports.updateExamStaff = async (req, res) => {
  const { examId, staffId } = req.params;
  const { staff_name, staff_role, rate, preparation_days, examination_days, cleaning_days } = req.body;

  // Verify exam belongs to faculty and is editable
  const exam = await pool.query(
    `SELECT id, status FROM exams WHERE id=$1 AND faculty_id=$2`,
    [examId, req.user.id]
  );

  if (exam.rows.length === 0) {
    return res.status(404).json({ message: "Exam not found" });
  }

  if (exam.rows[0].status !== "draft" && exam.rows[0].status !== "rejected") {
    return res.status(400).json({ message: "Cannot modify submitted claim" });
  }

  // Update staff member
  await pool.query(
    `UPDATE exam_staff_members SET
      staff_name=$1,
      staff_role=$2,
      rate=$3,
      preparation_days=$4,
      examination_days=$5,
      cleaning_days=$6
    WHERE id=$7 AND exam_id=$8`,
    [
      staff_name,
      staff_role,
      rate ? Number(rate) : 0,
      preparation_days || 0,
      examination_days || 0,
      cleaning_days || 0,
      staffId,
      examId
    ]
  );

  return res.json({ message: "Staff member updated successfully" });
};

/**
 * Delete Exam Staff Member
 */
exports.deleteExamStaff = async (req, res) => {
  const { examId, staffId } = req.params;

  // Verify exam belongs to faculty and is editable
  const exam = await pool.query(
    `SELECT id, status FROM exams WHERE id=$1 AND faculty_id=$2`,
    [examId, req.user.id]
  );

  if (exam.rows.length === 0) {
    return res.status(404).json({ message: "Exam not found" });
  }

  if (exam.rows[0].status !== "draft" && exam.rows[0].status !== "rejected") {
    return res.status(400).json({ message: "Cannot modify submitted claim" });
  }

  // Delete staff member
  await pool.query(
    `DELETE FROM exam_staff_members WHERE id=$1 AND exam_id=$2`,
    [staffId, examId]
  );

  return res.json({ message: "Staff member deleted successfully" });
};

/**
 * Get Batch Size for Exam
 */
exports.getBatchSize = async (req, res) => {
  const examId = req.params.id;

  // Verify exam belongs to faculty
  const exam = await pool.query(
    `SELECT exam_type, program FROM exams WHERE id=$1 AND faculty_id=$2`,
    [examId, req.user.id]
  );

  if (exam.rows.length === 0) {
    return res.status(404).json({ message: "Exam not found" });
  }

  const { exam_type, program } = exam.rows[0];

  // Get batch size from database
  const batchQuery = await pool.query(
    `SELECT 
      CASE 
        WHEN $1 = 'PR' THEN practical_size
        WHEN $1 = 'OR' THEN oral_size
        WHEN $1 = 'TW' THEN termwork_size
        ELSE project_oral_size
      END as batch_size
    FROM batch_sizes 
    WHERE program = $2`,
    [exam_type, program]
  );

  if (batchQuery.rows.length === 0) {
    return res.json({ batch_size: 1 }); // Default to 1 if not found
  }

  return res.json({ batch_size: batchQuery.rows[0].batch_size || 1 });
};

/**
 * Get Staff Role Rates
 */
exports.getStaffRates = async (req, res) => {
  try {
    const rates = await pool.query(
      `SELECT staff_role, preparation_rate, per_batch_rate, cleaning_rate 
       FROM staff_role_rates 
       ORDER BY staff_role`
    );

    return res.json(rates.rows);
  } catch (err) {
    console.error("Failed to fetch staff rates:", err);
    return res.status(500).json({ message: "Failed to fetch staff rates" });
  }
};



