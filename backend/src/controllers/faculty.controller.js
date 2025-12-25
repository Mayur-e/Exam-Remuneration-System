const pool = require("../config/db");

/**
 * Create Exam (Form selection + common header)
 */
exports.createExam = async (req, res) => {
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
    (faculty_id, exam_type, program, level, students_count,
     subject_name, subject_code, semester, academic_year, exam_date, is_backlog)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING id
    `,
    [
      req.user.id,
      exam_type,
      program,
      level || null,
      safeStudentsCount,
      subject_name || null,
      subject_code || null,
      semester || null,
      academic_year || null,
      exam_date || null,
      Boolean(is_backlog)
    ]
  );

  const { id } = result.rows[0];

  return res.status(201).json({ id });

};

/**
 * Add / Update Exam Staff (STAFF form only)
 */
exports.addExamStaff = async (req, res) => {
  const examId = req.params.id;
  const { staff_role, count, preparation_days, cleaning_days } = req.body;

  await pool.query(
    `
    INSERT INTO exam_staff (
      exam_id,
      staff_role,
      count,
      preparation_days,
      cleaning_days
    )
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (exam_id, staff_role)
    DO UPDATE SET
      count = EXCLUDED.count,
      preparation_days = EXCLUDED.preparation_days,
      cleaning_days = EXCLUDED.cleaning_days
    `,
    [
      examId,
      staff_role,
      count,
      preparation_days || 0,
      cleaning_days || 0
    ]
  );

  return res.json({ message: "Staff details saved" });
};

/**
 * Submit Exam (Triggers calculation)
 */
exports.submitExam = async (req, res) => {
  const examId = req.params.id;

  // Ensure exam belongs to faculty
  const exam = await pool.query(
    `SELECT id FROM exams WHERE id=$1 AND faculty_id=$2`,
    [examId, req.user.id]
  );

  if (exam.rows.length === 0) {
    return res.status(404).json({ message: "Exam not found" });
  }

  // Lock exam
  await pool.query(
    `UPDATE exams SET status='submitted' WHERE id=$1`,
    [examId]
  );

  // 🔥 TRIGGER CALCULATION
  await pool.query(`SELECT calculate_exam($1)`, [examId]);

  return res.json({ message: "Claim submitted and calculated" });
};




/**
 * List Faculty’s Own Exams
 */
exports.listMyExams = async (req, res) => {
  const result = await pool.query(
    `
    SELECT
      e.id,
      e.exam_type,
      e.subject_name,
      e.status,
      r.total_amount
    FROM exams e
    LEFT JOIN remuneration_calculations r ON r.exam_id = e.id
    WHERE e.faculty_id = $1
    ORDER BY e.created_at DESC
    `,
    [req.user.id]
  );

  return res.json(result.rows);
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

  return res.json({
    exam: exam.rows[0],
    staff: staff.rows,
    calculation: calculation.rows[0] || null
  });
};

exports.dashboardStats = async (req, res) => {
  const facultyId = req.user.id;

  const { rows } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
      COUNT(*) FILTER (WHERE status = 'submitted') AS pending_count,
      COALESCE(SUM(rc.total_amount), 0) AS total_amount
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
      r.examiner_amount,
      r.staff_amount,
      r.chairman_allowance,
      r.conveyance_amount,
      r.total_amount,
      r.min_applied
    FROM remuneration_calculations r
    JOIN exams e ON e.id = r.exam_id
    WHERE e.id=$1 AND e.faculty_id=$2
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

  return res.json(result.rows[0]);
};
