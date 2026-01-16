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
    is_backlog
  } = req.body;

  if (
    !claim_form_type ||
    !['TEACHING_INTERNAL', 'TEACHING_EXTERNAL', 'NON_TEACHING'].includes(claim_form_type)
  ) {
    return res.status(400).json({
      message: "Invalid claim form type",
    });
  }
  // 🔒 HARD VALIDATION
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

  // ✅ Now safe to insert
  const result = await pool.query(
    `
    INSERT INTO exams
    (faculty_id, claim_form_type, exam_type, program, level, students_count,
     subject_name, subject_code, semester, academic_year, exam_date, is_backlog)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
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
      Boolean(is_backlog) || false
    ]
  );

  const { id } = result.rows[0];

  return res.status(201).json({ id });

};

/**
 * Add Exam Staff Member (NON_TEACHING form)
 */
exports.addExamStaff = async (req, res) => {
  const examId = req.params.id;
  const { staff_name, staff_role, preparation_days, examination_days, cleaning_days } = req.body;

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
      preparation_days,
      examination_days,
      cleaning_days
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    `,
    [
      examId,
      staff_name,
      staff_role,
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

  // Ensure exam belongs to faculty
  const exam = await pool.query(
    `
    SELECT id, claim_form_type
    FROM exams
    WHERE id=$1 AND faculty_id=$2
    `,
    [examId, req.user.id]
  );

  if (exam.rows.length === 0) {
    return res.status(404).json({ message: "Exam not found" });
  }

  if (exam.rows[0].claim_form_type === 'TEACHING_EXTERNAL') {
    return res.status(400).json({
      message: "External claims must be submitted by external examiner"
    });
  }


  if (exam.rows.length === 0) {
    return res.status(404).json({ message: "Exam not found" });
  }

  // Lock exam
  await pool.query(
    `UPDATE exams SET status='submitted' WHERE id=$1`,
    [examId]
  );

  // Save Allowances (Upsert into remuneration_calculations)
  const { chairman_allowance, conveyance_amount } = req.body;

  await pool.query(
    `INSERT INTO remuneration_calculations (exam_id, chairman_allowance, conveyance_amount)
     VALUES ($1, $2, $3)
     ON CONFLICT (exam_id) DO UPDATE SET
       chairman_allowance = EXCLUDED.chairman_allowance,
       conveyance_amount = EXCLUDED.conveyance_amount`,
    [examId, chairman_allowance || 0, conveyance_amount || 0]
  );

  // 🔥 TRIGGER CALCULATION
  await pool.query(`SELECT calculate_exam($1)`, [examId]);

  return res.json({ message: "Claim submitted and calculated" });
};


/**
 * List Faculty’s Own Exams
 */
exports.listMyExams = async (req, res) => {
  try {
    const result = await pool.query(
      `
    SELECT
      e.id,
      e.exam_type,
      e.subject_name,
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

  // Get rejection history if any
  const rejections = await pool.query(
    `SELECT ca.comment, ca.action_at, u.name AS rejected_by
     FROM claim_actions ca
     JOIN users u ON ca.action_by = u.id
     WHERE ca.exam_id = $1 AND ca.action_type = 'REJECTED'
     ORDER BY ca.action_at DESC`,
    [examId]
  );

  return res.json({
    exam: exam.rows[0],
    staff: staff.rows,
    calculation: calculation.rows[0] || null,
    rejections: rejections.rows
  });
};

exports.dashboardStats = async (req, res) => {
  const facultyId = req.user.id;

  const { rows } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
      COUNT(*) FILTER (WHERE status = 'submitted') AS pending_count,
      COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count,
      COALESCE(SUM(rc.net_amount), 0) AS total_amount
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
      CASE
        WHEN e.program IN ('BTECH','BVOC') AND e.level IN ('FY','SY')
          THEN e.students_count * rr.fy_sy_rate
        WHEN e.program IN ('BTECH','BVOC')
          THEN e.students_count * rr.ty_final_rate
        ELSE
          e.students_count * rr.mtech_mca_rate
      END AS examiner_amount_calculated,

      r.examiner_amount,
      r.staff_amount,
      r.chairman_allowance,
      r.conveyance_amount,
      r.total_amount,
      r.tds_amount,
      r.net_amount,
      r.min_applied

    FROM remuneration_calculations r
    JOIN exams e ON e.id = r.exam_id
    JOIN remuneration_rates rr ON rr.exam_type = e.exam_type
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

  // Get rejection history if any
  const rejections = await pool.query(
    `SELECT ca.comment, ca.action_at, u.name AS rejected_by
     FROM claim_actions ca
     JOIN users u ON ca.action_by = u.id
     WHERE ca.exam_id = $1 AND ca.action_type = 'REJECTED'
     ORDER BY ca.action_at DESC`,
    [id]
  );

  return res.json({
    ...result.rows[0],
    rejections: rejections.rows
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
    is_backlog
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
      updated_at=NOW()
    WHERE id=$11
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

  if (exam.rows[0].status !== "draft") {
    return res.status(400).json({
      message: "Cannot generate link after submission"
    });
  }

  // 2. Revoke existing unused links
  await pool.query(
    `
    UPDATE external_exam_links
    SET used = true
    WHERE exam_id = $1
      AND used = false
    `,
    [examId]
  );

  // 3. Generate fresh token
  const token = crypto.randomBytes(32).toString("hex");

  await pool.query(
    `
    INSERT INTO external_exam_links (exam_id, token, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '7 days')
    `,
    [examId, token]
  );

  res.json({
    link: `${process.env.FRONTEND_URL}/external/claim/${token}`,
    message: "New external link generated (old links revoked)"
  });
};

/* ==============================
   GET PROFILE
================================ */
exports.getProfile = async (req, res) => {
  const facultyId = req.user.id;

  const user = await pool.query(
    `SELECT id, name, email, department, created_at FROM users WHERE id=$1`,
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
  const { name, department, bank } = req.body;

  try {
    // Update user profile
    if (name || department) {
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

      params.push(facultyId);
      await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        params
      );
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
    // Check if claim exists, belongs to faculty, and is rejected
    const exam = await pool.query(
      `SELECT id, status FROM exams WHERE id = $1 AND faculty_id = $2`,
      [examId, facultyId]
    );

    if (exam.rowCount === 0) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (exam.rows[0].status !== 'rejected') {
      return res.status(400).json({ message: "Only rejected claims can be resubmitted" });
    }

    // Update status back to submitted
    await pool.query(
      `UPDATE exams SET status = 'submitted', updated_at = NOW() WHERE id = $1`,
      [examId]
    );

    res.json({ message: "Claim resubmitted successfully" });
  } catch (error) {
    console.error("Resubmit claim error:", error);
    res.status(500).json({ message: "Failed to resubmit claim" });
  }
};
