const pool = require("../config/db");

/**
 * GET external claim (read-only exam details)
 * Public – token based
 */
exports.getExternalClaim = async (req, res) => {
  const { token } = req.params;

  try {
    // 1. Check Link Status first
    const linkCheck = await pool.query(
      `SELECT exam_id, used, expires_at FROM external_exam_links WHERE token = $1`,
      [token]
    );

    if (linkCheck.rows.length === 0) {
      return res.status(404).json({ message: "Invalid link" });
    }

    const link = linkCheck.rows[0];

    // Allow access if link is used BUT exam is rejected (for resubmission)
    const examStatus = await pool.query(
      `SELECT status FROM exams WHERE id = $1`,
      [link.exam_id]
    );

    if (link.used && examStatus.rows[0].status !== 'rejected') {
      return res.status(400).json({ message: "This claim has already been submitted." });
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(400).json({ message: "This link has expired." });
    }

    // 2. Fetch Exam Details
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
      WHERE e.id = $1
        AND e.claim_form_type = 'TEACHING_EXTERNAL'
      `,
      [link.exam_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Claim not found or explicitly closed.",
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

  // VALIDATION: Ensure all required fields are provided
  if (!full_name || !email || !mobile || !parent_institute || !pan_number ||
    !bank_name || !account_number || !ifsc_code) {
    return res.status(400).json({
      message: "All fields are required. Please fill in your complete details including bank information."
    });
  }

  // Files (multer)
  const panFile = req.files?.pan_document?.[0];
  const chequeFile = req.files?.cancelled_cheque?.[0];
  const travelProofFile = req.files?.travel_proof_document?.[0];

  const pan_document_url = panFile ? `/uploads/external/pan/${panFile.filename}` : null;
  const cancelled_cheque_url = chequeFile ? `/uploads/external/cheque/${chequeFile.filename}` : null;
  const travel_proof_url = travelProofFile ? `/uploads/external/travel/${travelProofFile.filename}` : null;

  // Calculate travel allowance
  // Travel details to be filled by Billing Incharge
  const travel_allowance = 0;
  const isLocal = false;
  const days = 0;

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

    // VALIDATION: Check if exam has valid subject and rates configured
    const examValidation = await client.query(
      `SELECT e.subject_code, e.exam_type 
       FROM exams e 
       WHERE e.id = $1`,
      [examId]
    );

    if (examValidation.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Exam not found" });
    }

    const examData = examValidation.rows[0];

    // VALIDATION: Subject must exist
    if (examData.subject_code) {
      const subjectCheck = await client.query(
        `SELECT 1 FROM subjects WHERE code = $1 LIMIT 1`,
        [examData.subject_code]
      );

      if (subjectCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Subject code "${examData.subject_code}" not found in master subjects list. Please contact the faculty who created this exam.`
        });
      }
    }

    // VALIDATION: Remuneration rates must be configured
    const rateCheck = await client.query(
      `SELECT 1 FROM remuneration_rates WHERE exam_type = $1 LIMIT 1`,
      [examData.exam_type]
    );

    if (rateCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `Remuneration rates not configured for exam type "${examData.exam_type}". Please contact administrator.`
      });
    }

    // Check if this is a resubmission
    const examCheck = await client.query(
      `SELECT external_examiner_id, status FROM exams WHERE id = $1`,
      [examId]
    );

    const isResubmission = examCheck.rows[0].external_examiner_id !== null && examCheck.rows[0].status === 'rejected';
    let examinerId;

    if (isResubmission) {
      // UPDATE existing external examiner
      examinerId = examCheck.rows[0].external_examiner_id;

      await client.query(
        `UPDATE external_examiners SET
          full_name = $1,
          email = $2,
          mobile = $3,
          parent_institute = $4,
          pan_number = $5,
          bank_name = $6,
          branch_name = $7,
          account_number = $8,
          ifsc_code = $9,
          pan_document_url = $10,
          cancelled_cheque_url = $11,
          is_local = $12,
          journey_days = $13,
          travel_allowance = $14,
          travel_proof_url = $15
        WHERE id = $16`,
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
          isLocal,
          days,
          travel_allowance,
          travel_proof_url,
          examinerId
        ]
      );
    } else {
      // INSERT new external examiner
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
          cancelled_cheque_url,
          is_local,
          journey_days,
          travel_allowance,
          travel_proof_url
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
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
          isLocal,
          days,
          travel_allowance,
          travel_proof_url,
        ]
      );

      examinerId = examinerRes.rows[0].id;
    }

    /**
     * 3️⃣ Attach examiner & submit exam (or resubmit)
     */
    await client.query(
      `
      UPDATE exams
      SET
        external_examiner_id = $1,
        status = 'UNDER_COORDINATOR_REVIEW',
        updated_at = NOW()
      WHERE id = $2
        AND (status = 'draft' OR status = 'rejected' OR status = 'COORDINATOR_REJECTED')
        AND claim_form_type = 'TEACHING_EXTERNAL'
      `,
      [examinerId, examId]
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
     * 5️⃣ Save Travel Allowance as Conveyance Amount & Calculate
     */
    await client.query(
      `INSERT INTO remuneration_calculations (exam_id, conveyance_amount)
       VALUES ($1, $2)
       ON CONFLICT (exam_id) DO NOTHING`,
      [examId, travel_allowance]
    );

    // Trigger calculation
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

/**
 * GET external claim info (for resubmission)
 * Includes rejection history and existing examiner data
 */
exports.getExternalClaimInfo = async (req, res) => {
  const { token } = req.params;

  try {
    // 1. Check Link
    const linkCheck = await pool.query(
      `SELECT exam_id FROM external_exam_links WHERE token = $1`,
      [token]
    );

    if (linkCheck.rows.length === 0) {
      return res.status(404).json({ message: "Invalid link" });
    }

    const examId = linkCheck.rows[0].exam_id;

    // 2. Get Exam Details
    const exam = await pool.query(
      `SELECT e.*, ee.* 
       FROM exams e
       LEFT JOIN external_examiners ee ON ee.id = e.external_examiner_id
       WHERE e.id = $1`,
      [examId]
    );

    if (exam.rows.length === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // 3. Get Rejection History
    const rejections = await pool.query(
      `SELECT ca.comment, ca.remarks, ca.action_at, u.name AS rejected_by
       FROM claim_actions ca
       JOIN users u ON ca.action_by = u.id
       WHERE ca.exam_id = $1 AND ca.action_type IN ('REJECT', 'REJECTED')
       ORDER BY ca.action_at DESC`,
      [examId]
    );

    res.json({
      exam: exam.rows[0],
      rejections: rejections.rows,
      isResubmission: (exam.rows[0].status === 'rejected' || exam.rows[0].status === 'COORDINATOR_REJECTED') && exam.rows[0].external_examiner_id !== null
    });
  } catch (err) {
    console.error("getExternalClaimInfo error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
