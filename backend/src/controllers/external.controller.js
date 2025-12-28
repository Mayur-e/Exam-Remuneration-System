const pool = require("../config/db");

/**
 * GET external claim (read-only exam details)
 * Public – token based
 */
exports.getExternalClaim = async (req, res) => {
  const { token } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        e.id,
        e.exam_type,
        e.program,
        e.level,
        e.students_count,
        e.subject_name,
        e.subject_code,
        e.semester,
        e.academic_year,
        e.exam_date
      FROM exams e
      JOIN external_exam_links l ON l.exam_id = e.id
      WHERE l.token = $1
        AND l.used = false
        AND (l.expires_at IS NULL OR l.expires_at > NOW())
        AND e.claim_form_type = 'TEACHING_EXTERNAL'
        AND e.status = 'draft'
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Invalid or expired external claim link",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("getExternalClaim error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST external examiner submission
 * Handles:
 * - Examiner details
 * - PAN + cheque upload
 * - Exam submission
 * - Calculation trigger
 */
exports.submitExternalClaim = async (req, res) => {
  const { token } = req.params;

  const {
    full_name,
    email,
    mobile,
    parent_institute,
    pan_number,
    bank_name,
    branch_name,
    account_number,
    ifsc_code,
  } = req.body;

  // Files (multer)
  const panFile = req.files?.pan_document?.[0];
  const chequeFile = req.files?.cancelled_cheque?.[0];

  const pan_document_url = panFile ? `/uploads/${panFile.filename}` : null;
  const cancelled_cheque_url = chequeFile ? `/uploads/${chequeFile.filename}` : null;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /**
     * 1️⃣ Validate token (LOCK ROW)
     */
    const linkRes = await client.query(
      `
      SELECT exam_id
      FROM external_exam_links
      WHERE token = $1
        AND used = false
        AND (expires_at IS NULL OR expires_at > NOW())
      FOR UPDATE
      `,
      [token]
    );

    if (linkRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Invalid or expired link",
      });
    }

    const examId = linkRes.rows[0].exam_id;

    /**
     * 2️⃣ Insert External Examiner
     */
    const examinerRes = await client.query(
      `
      INSERT INTO external_examiners (
        full_name,
        email,
        mobile,
        parent_institute,
        pan_number,
        bank_name,
        branch_name,
        account_number,
        ifsc_code,
        pan_document_url,
        cancelled_cheque_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id
      `,
      [
        full_name,
        email,
        mobile,
        parent_institute,
        pan_number,
        bank_name,
        branch_name,
        account_number,
        ifsc_code,
        pan_document_url,
        cancelled_cheque_url,
      ]
    );

    const externalExaminerId = examinerRes.rows[0].id;

    /**
     * 3️⃣ Attach examiner & submit exam
     */
    await client.query(
      `
      UPDATE exams
      SET
        external_examiner_id = $1,
        status = 'submitted',
        updated_at = NOW()
      WHERE id = $2
        AND status = 'draft'
        AND claim_form_type = 'TEACHING_EXTERNAL'
      `,
      [externalExaminerId, examId]
    );

    /**
     * 4️⃣ Mark link as used (NO regeneration after submit)
     */
    await client.query(
      `
      UPDATE external_exam_links
      SET used = true
      WHERE token = $1
      `,
      [token]
    );

    /**
     * 5️⃣ Calculate remuneration
     */
    await client.query(`SELECT calculate_exam($1)`, [examId]);

    await client.query("COMMIT");

    res.json({
      message: "External claim submitted successfully",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("submitExternalClaim error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};
