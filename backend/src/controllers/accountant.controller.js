const pool = require("../config/db");

/* ==============================
   DASHBOARD STATS
================================ */
exports.dashboardStats = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'submitted') AS submitted,
      COUNT(*) FILTER (WHERE status = 'approved') AS approved_pending,
      COUNT(*) FILTER (WHERE status = 'paid') AS paid,
      COALESCE(
        SUM(rc.total_amount) FILTER (WHERE e.status = 'paid'),
        0
      ) AS total_paid_amount
    FROM exams e
    LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id
  `);

  res.json(rows[0]);
};


/* ==============================
   CLAIM LIST
================================ */
exports.listSubmittedClaims = async (req, res) => {
  const { status } = req.query;

  const where = status
    ? `WHERE e.status = $1`
    : `WHERE e.status IN ('submitted','approved','paid')`;

  const params = status ? [status] : [];

  const { rows } = await pool.query(
    `
    SELECT
      e.id,
      u.name AS faculty_name,
      e.exam_type,
      e.subject_name,
      e.program,
      e.status,
      rc.total_amount,
      e.created_at
    FROM exams e
    JOIN users u ON u.id = e.faculty_id
    LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id
    ${where}
    ORDER BY e.created_at DESC
    `,
    params
  );

  res.json(rows);
};


/* ==============================
   CLAIM DETAILS
================================ */
exports.getClaimDetails = async (req, res) => {
  const examId = req.params.id;

  const exam = await pool.query(
    `SELECT e.*, u.name, u.email
     FROM exams e
     JOIN users u ON u.id = e.faculty_id
     WHERE e.id = $1`,
    [examId]
  );

  if (!exam.rows.length)
    return res.status(404).json({ message: "Claim not found" });

  const staff = await pool.query(
    `SELECT * FROM exam_staff WHERE exam_id = $1`,
    [examId]
  );

  const calc = await pool.query(
    `SELECT * FROM remuneration_calculations WHERE exam_id = $1`,
    [examId]
  );

  res.json({
    exam: exam.rows[0],
    staff: staff.rows,
    calculation: calc.rows[0]
  });
};

/* ==============================
   APPROVE CLAIM
================================ */
exports.approveClaim = async (req, res) => {
  const examId = req.params.id;

  await pool.query("BEGIN");

  await pool.query(
    `UPDATE exams SET status='approved' WHERE id=$1 AND status='submitted'`,
    [examId]
  );

  await pool.query(
    `
    INSERT INTO claim_actions
    (exam_id, action_by, action_role, action_type)
    VALUES ($1,$2,'ACCOUNTANT','APPROVED')
    `,
    [examId, req.user.id]
  );

  await pool.query("COMMIT");

  res.json({ message: "Claim approved" });
};


/* ==============================
   REJECT CLAIM
================================ */
exports.rejectClaim = async (req, res) => {
  const examId = req.params.id;
  const { remarks } = req.body;

  await pool.query(
    `UPDATE exams SET status='rejected' WHERE id=$1`,
    [examId]
  );

  await pool.query(
    `
    INSERT INTO claim_actions
    (exam_id, action_by, action_role, action_type, remarks)
    VALUES ($1,$2,'ACCOUNTANT','REJECTED',$3)
    `,
    [examId, req.user.id, remarks || null]
  );

  res.json({ message: "Claim rejected" });
};

/* ==============================
   MARK PAYMENT
================================ */
exports.markAsPaid = async (req, res) => {
  const examId = req.params.id;
  const { transaction_ref, method, payment_date } = req.body;

  const calc = await pool.query(
    `SELECT id, total_amount FROM remuneration_calculations WHERE exam_id=$1`,
    [examId]
  );

  if (!calc.rows.length) {
    return res.status(400).json({ message: "Calculation missing" });
  }

  await pool.query("BEGIN");

  await pool.query(
    `
    INSERT INTO payments (
      remuneration_id,
      amount,
      accountant_id,
      transaction_ref,
      method,
      status,
      payment_date
    )
    VALUES ($1,$2,$3,$4,$5,'paid',$6)
    `,
    [
      calc.rows[0].id,
      calc.rows[0].total_amount,
      req.user.id,
      transaction_ref,
      method,
      payment_date
    ]
  );

  await pool.query(
    `UPDATE exams SET status='paid' WHERE id=$1 AND status='approved'`,
    [examId]
  );

  await pool.query(
    `
    INSERT INTO claim_actions
    (exam_id, action_by, action_role, action_type)
    VALUES ($1,$2,'ACCOUNTANT','PAID')
    `,
    [examId, req.user.id]
  );

  await pool.query("COMMIT");

  res.json({ message: "Payment recorded successfully" });
};


/* ==============================
   FACULTY LIST
================================ */
exports.listFaculty = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT id, name, email, department
    FROM users
    WHERE role='FACULTY'
    ORDER BY name
  `);

  res.json(rows);
};

/* ==============================
   FACULTY DETAILS + BANK
================================ */
exports.getFacultyDetails = async (req, res) => {
  const facultyId = req.params.id;

  const user = await pool.query(
    `SELECT id, name, email, department FROM users WHERE id=$1`,
    [facultyId]
  );

  const bank = await pool.query(
    `SELECT * FROM faculty_bank_accounts WHERE faculty_id=$1`,
    [facultyId]
  );

  res.json({
    faculty: user.rows[0],
    bank: bank.rows[0] || null
  });
};


exports.listPayments = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      p.id,
      p.amount,
      p.method,
      p.transaction_ref,
      p.payment_date,
      u.name AS faculty_name
    FROM payments p
    JOIN remuneration_calculations rc ON rc.id = p.remuneration_id
    JOIN exams e ON e.id = rc.exam_id
    JOIN users u ON u.id = e.faculty_id
    ORDER BY p.payment_date DESC
  `);

  res.json(rows);
};
