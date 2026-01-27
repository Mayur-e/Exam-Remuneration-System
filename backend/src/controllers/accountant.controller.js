const pool = require("../config/db");

/* ==============================
   DASHBOARD STATS
================================ */
exports.dashboardStats = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status IN ('submitted', 'approved')) AS pending_count,
      COUNT(*) FILTER (WHERE status = 'paid') AS paid_count,
      COALESCE(
        SUM(rc.net_amount) FILTER (WHERE e.status IN ('submitted', 'approved')),
        0
      ) AS pending_amount,
      COALESCE(
        SUM(rc.net_amount) FILTER (WHERE e.status = 'paid'),
        0
      ) AS paid_amount,
      COALESCE(
        SUM(rc.net_amount),
        0
      ) AS total_amount
    FROM exams e
    LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id
    WHERE e.status IN ('submitted', 'approved', 'paid')
  `);

  res.json(rows[0]);
};


/* ==============================
   CLAIM LIST
================================ */
exports.listSubmittedClaims = async (req, res) => {
  const { status, facultyId } = req.query;

  // Filter logic:
  // - 'submitted' shows only submitted claims (pending approval)
  // - 'approved' shows only approved claims (ready for payment)
  // - 'paid' shows only paid claims
  // - no status shows all
  let where = `WHERE e.status IN ('submitted','approved','paid')`;
  let params = [];
  let paramIndex = 1;

  if (status === 'submitted') {
    where = `WHERE e.status = 'submitted'`;
  } else if (status === 'approved') {
    where = `WHERE e.status = 'approved'`;
  } else if (status === 'paid') {
    where = `WHERE e.status = 'paid'`;
  } else if (status) {
    where = `WHERE e.status = $${paramIndex}`;
    params = [status];
    paramIndex++;
  }

  // Add faculty filter if provided
  if (facultyId) {
    where += ` AND e.faculty_id = $${paramIndex}`;
    params.push(facultyId);
  }

  const { rows } = await pool.query(
    `
    SELECT
      e.id,
      CASE 
        WHEN e.claim_form_type = 'TEACHING_EXTERNAL' THEN ex.full_name 
        ELSE u.name 
      END AS claimant_name,
      e.claim_form_type,
      e.exam_type,
      e.subject_name,
      e.program,
      e.status,
      rc.net_amount AS total_amount,
      e.created_at,
      u.name AS original_faculty_name
    FROM exams e
    JOIN users u ON u.id = e.faculty_id
    LEFT JOIN external_examiners ex ON ex.id = e.external_examiner_id
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

  try {
    // Get exam details with faculty and external examiner bank info
    const exam = await pool.query(
      `SELECT
        e.*,
        u.name AS faculty_name,
        u.email AS faculty_email,
        u.department AS faculty_department,
        fb.bank_name AS faculty_bank_name,
        fb.branch_name AS faculty_branch_name,
        fb.account_number AS faculty_account_number,
        fb.ifsc_code AS faculty_ifsc_code,
        fb.pan_number AS faculty_pan_number,
        fb.cancelled_cheque_url AS faculty_cheque_url,
        fb.pan_document_url AS faculty_pan_url,
        ee.full_name AS external_examiner_name,
        ee.email AS external_examiner_email,
        ee.mobile AS external_examiner_mobile,
        ee.parent_institute,
        ee.bank_name AS external_bank_name,
        ee.branch_name AS external_branch_name,
        ee.account_number AS external_account_number,
        ee.ifsc_code AS external_ifsc_code,
        ee.pan_number AS external_pan_number,
        ee.pan_document_url AS external_pan_url,
        ee.cancelled_cheque_url AS external_cheque_url,
        ee.travel_proof_url,
        ee.is_local,
        ee.journey_days,
        ee.travel_allowance,
        u.mobile AS faculty_mobile,
        u.pan_card AS faculty_pan_card,
        e.second_examiner
      FROM exams e
      JOIN users u ON u.id = e.faculty_id
      LEFT JOIN faculty_bank_accounts fb ON u.id = fb.faculty_id
      LEFT JOIN external_examiners ee ON e.external_examiner_id = ee.id
      WHERE e.id = $1`,
      [examId]
    );

    if (!exam.rows.length) {
      return res.status(404).json({ message: "Claim not found" });
    }

    const examData = exam.rows[0];

    // Get staff members with calculated amounts (for non-teaching claims)
    let staffData = [];
    if (examData.claim_form_type === 'NON_TEACHING') {
      const staff = await pool.query(
        `SELECT esm.*, srr.preparation_rate, srr.per_batch_rate, srr.cleaning_rate
         FROM exam_staff_members esm
         LEFT JOIN staff_role_rates srr ON esm.staff_role = srr.staff_role
         WHERE esm.exam_id = $1 
         ORDER BY esm.id`,
        [examId]
      );

      // Calculate amounts for each staff member
      const countDates = (dateStr) => {
        if (!dateStr) return 0;
        return dateStr.split(',').map(d => d.trim()).filter(Boolean).length;
      };

      const prepDays = countDates(examData.prep_dates);
      const examDays = countDates(examData.exam_dates);
      const cleanDays = countDates(examData.cleaning_dates);
      const batchSize = parseInt(examData.batch_size) || 12;
      const totalBatches = Math.ceil(parseInt(examData.students_count) / batchSize);

      staffData = staff.rows.map(s => {
        const prepRate = parseFloat(s.preparation_rate) || 0;
        const batchRate = parseFloat(s.per_batch_rate) || 0;
        const cleanRate = parseFloat(s.cleaning_rate) || 0;
        const isExpert = s.staff_role.toLowerCase().includes('expert');

        const prepCleanAmount = isExpert ? 0 : ((prepRate * prepDays) + (cleanRate * cleanDays));
        const batchAmount = isExpert ? (batchRate * totalBatches) : (batchRate * totalBatches * examDays);
        const totalAmount = prepCleanAmount + batchAmount;

        return {
          ...s,
          rate: batchRate,
          prep_clean_amount: prepCleanAmount,
          batch_amount: batchAmount,
          total_amount: totalAmount
        };
      });
    } else {
      // For teaching claims, just get basic staff info
      const staff = await pool.query(
        `SELECT * FROM exam_staff_members WHERE exam_id = $1 ORDER BY id`,
        [examId]
      );
      staffData = staff.rows;
    }

    // Get calculation details with computed rate
    const calc = await pool.query(
      `SELECT
        rc.*,
        CASE
          WHEN e.program IN ('BTECH','BVOC') AND e.level IN ('FY','SY')
            THEN e.students_count * rr.fy_sy_rate
          WHEN e.program IN ('BTECH','BVOC')
            THEN e.students_count * rr.ty_final_rate
          ELSE
            e.students_count * rr.mtech_mca_rate
        END AS examiner_amount_calculated
      FROM remuneration_calculations rc
      JOIN exams e ON e.id = rc.exam_id
      LEFT JOIN remuneration_rates rr ON rr.exam_type = e.exam_type
      WHERE rc.exam_id = $1`,
      [examId]
    );

    // Get payment info if exists
    const payment = await pool.query(
      `SELECT p.*, u.name AS processed_by
       FROM payments p
       JOIN users u ON p.accountant_id = u.id
       WHERE p.exam_id = $1`,
      [examId]
    );

    // Get claim actions (approval/rejection history)
    const actions = await pool.query(
      `SELECT ca.*, u.name AS action_by_name
       FROM claim_actions ca
       JOIN users u ON ca.action_by = u.id
       WHERE ca.exam_id = $1
       ORDER BY ca.action_at DESC`,
      [examId]
    );

    res.json({
      exam: examData,
      staff: staffData,
      calculation: calc.rows[0] || null,
      payment: payment.rows[0] || null,
      actions: actions.rows
    });
  } catch (err) {
    console.error("getClaimDetails error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ==============================
   APPROVE CLAIM
================================ */
exports.approveClaim = async (req, res) => {
  const examId = req.params.id;

  try {
    await pool.query("BEGIN");

    const result = await pool.query(
      `UPDATE exams SET status='approved' WHERE id=$1 AND status='submitted' RETURNING id`,
      [examId]
    );

    if (result.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ message: "Claim not found or already processed" });
    }

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
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Approve claim error:", error);
    res.status(500).json({ message: "Failed to approve claim" });
  }
};


/* ==============================
   REJECT CLAIM
================================ */
exports.rejectClaim = async (req, res) => {
  const examId = req.params.id;
  const { reason } = req.body;

  if (!reason || reason.trim() === '') {
    return res.status(400).json({ message: "Rejection reason is required" });
  }

  try {
    await pool.query("BEGIN");

    const result = await pool.query(
      `UPDATE exams SET status='rejected' WHERE id=$1 AND status IN ('submitted', 'approved') RETURNING id`,
      [examId]
    );

    if (result.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ message: "Claim not found or cannot be rejected" });
    }

    await pool.query(
      `
      INSERT INTO claim_actions
      (exam_id, action_by, action_role, action_type, comment)
      VALUES ($1,$2,'ACCOUNTANT','REJECTED',$3)
      `,
      [examId, req.user.id, reason]
    );

    await pool.query("COMMIT");

    res.json({ message: "Claim rejected" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Reject claim error:", error);
    res.status(500).json({ message: "Failed to reject claim" });
  }
};

/* ==============================
   MARK PAYMENT
================================ */
exports.markAsPaid = async (req, res) => {
  const examId = req.params.id;
  const { reference_number, payment_method, payment_date, notes } = req.body;

  if (!reference_number || !payment_method || !payment_date) {
    return res.status(400).json({
      message: "Reference number, payment method, and payment date are required"
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get calculation and verify status
    const calc = await client.query(
      `SELECT e.id, e.status, rc.net_amount
       FROM exams e
       LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id
       WHERE e.id = $1`,
      [examId]
    );

    if (!calc.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Claim not found" });
    }

    const exam = calc.rows[0];

    if (exam.status !== 'submitted' && exam.status !== 'approved') {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `Cannot process payment. Current status: ${exam.status}`
      });
    }

    if (!exam.net_amount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Calculation missing" });
    }

    // Check if already paid
    const existing = await client.query(
      "SELECT id FROM payments WHERE exam_id = $1",
      [examId]
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Payment already recorded" });
    }

    // Insert payment
    await client.query(
      `INSERT INTO payments (
        exam_id,
        amount,
        payment_method,
        reference_number,
        payment_date,
        accountant_id,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [examId, exam.net_amount, payment_method, reference_number, payment_date, req.user.id, notes || null]
    );

    // Update exam status to paid
    await client.query(
      `UPDATE exams SET status = 'paid', updated_at = NOW() WHERE id = $1`,
      [examId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Payment recorded successfully",
      amount: exam.net_amount
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("markAsPaid error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};


/* ==============================
   FACULTY LIST
================================ */
exports.listFaculty = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.department,
      u.created_at,
      COUNT(e.id) FILTER (WHERE e.status IN ('submitted', 'approved')) AS active_claims,
      COUNT(e.id) AS total_claims
    FROM users u
    LEFT JOIN exams e ON e.faculty_id = u.id
    WHERE u.role='FACULTY'
    GROUP BY u.id, u.name, u.email, u.department, u.created_at
    ORDER BY u.name
  `);

  res.json(rows);
};

/* ==============================
   FACULTY DETAILS + BANK
================================ */
exports.getFacultyDetails = async (req, res) => {
  const facultyId = req.params.id;

  const user = await pool.query(
    `SELECT id, name, email, department, role, created_at, is_active FROM users WHERE id=$1`,
    [facultyId]
  );

  if (!user.rows.length) {
    return res.status(404).json({ message: "Faculty not found" });
  }

  const bank = await pool.query(
    `SELECT * FROM faculty_bank_accounts WHERE faculty_id=$1`,
    [facultyId]
  );

  const claims = await pool.query(
    `SELECT 
      e.id,
      e.subject_name,
      e.exam_type,
      e.status,
      e.created_at,
      rc.total_amount,
      rc.net_amount
    FROM exams e
    LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id
    WHERE e.faculty_id = $1
    ORDER BY e.created_at DESC`,
    [facultyId]
  );

  res.json({
    faculty: user.rows[0],
    bank: bank.rows[0] || null,
    claims: claims.rows
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

/* ==============================
   UPDATE PROFILE
================================ */
exports.updateProfile = async (req, res) => {
  const accountantId = req.user.id;
  const { name } = req.body;

  try {
    if (name) {
      await pool.query(
        `UPDATE users SET name = $1 WHERE id = $2`,
        [name, accountantId]
      );
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
