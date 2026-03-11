const pool = require("../config/db");

/* ==============================
   DASHBOARD STATS
================================ */
exports.getDashboardStats = async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE e.status != 'draft') AS total_claims,
        COALESCE(SUM(rc.net_amount) FILTER (WHERE e.status != 'draft'), 0) AS total_amount,
        
        COUNT(*) FILTER (WHERE e.status = 'submitted') AS submitted_claims,
        COALESCE(SUM(rc.net_amount) FILTER (WHERE e.status = 'submitted'), 0) AS submitted_amount,
        
        COUNT(*) FILTER (WHERE e.status = 'approved') AS approved_claims,
        COALESCE(SUM(rc.net_amount) FILTER (WHERE e.status = 'approved'), 0) AS approved_amount,
        
        COUNT(*) FILTER (WHERE e.status = 'paid') AS paid_claims,
        COALESCE(SUM(rc.net_amount) FILTER (WHERE e.status = 'paid'), 0) AS paid_amount,
        
        COUNT(*) FILTER (WHERE e.status IN ('rejected', 'coordinator_rejected')) AS rejected_claims,
        COALESCE(SUM(rc.net_amount) FILTER (WHERE e.status IN ('rejected', 'coordinator_rejected')), 0) AS rejected_amount,

        COUNT(*) FILTER (WHERE e.status IN ('review', 'under_review', 'verified', 'coordinator_submitted', 'under_coordinator_review')) AS review_claims,
        
        COUNT(*) FILTER (WHERE e.claim_form_type = 'TEACHING_EXTERNAL' AND e.status != 'draft') AS external_claims,
        COALESCE(SUM(rc.net_amount) FILTER (WHERE e.claim_form_type = 'TEACHING_EXTERNAL' AND e.status != 'draft'), 0) AS external_amount
      FROM exams e
      LEFT JOIN remuneration_calculations rc ON e.id = rc.exam_id
    `);

        // Get alerts
        const alerts = await pool.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE e.status IN ('submitted', 'SENT_TO_BILLING') 
          AND e.created_at < NOW() - INTERVAL '7 days'
        ) AS pending_beyond_limit,
        COUNT(DISTINCT ca.exam_id) FILTER (
          WHERE ca.action_type = 'REJECTED' AND e.status IN ('submitted', 'SENT_TO_BILLING')
        ) AS repeated_rejections,
        COUNT(*) FILTER (
          WHERE claim_form_type = 'TEACHING_EXTERNAL'
          AND external_examiner_id IS NULL
        ) AS external_without_docs,
        COUNT(*) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM remuneration_calculations rc 
            WHERE rc.exam_id = e.id AND rc.min_applied = true
          )
        ) AS rate_mismatch_flags
      FROM exams e
      LEFT JOIN claim_actions ca ON ca.exam_id = e.id
    `);

        // Get department-wise expenditures
        const deptExpenditures = await pool.query(`
      SELECT
        COALESCE(u.department, 'External') AS department,
        COALESCE(SUM(rc.net_amount), 0) AS total_expenditure
      FROM exams e
      JOIN users u ON e.faculty_id = u.id
      LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id
      WHERE e.status IN ('approved', 'paid')
      GROUP BY u.department
      ORDER BY total_expenditure DESC
    `);

        // Get recent claims
        const recentClaims = await pool.query(`
      SELECT
        e.id,
        e.subject_name,
        e.exam_type,
        e.status,
        e.created_at,
        CASE 
          WHEN e.claim_form_type = 'TEACHING_EXTERNAL' THEN ex.full_name 
          ELSE u.name 
        END AS claimant_name,
        u.department,
        rc.net_amount
      FROM exams e
      JOIN users u ON e.faculty_id = u.id
      LEFT JOIN external_examiners ex ON ex.id = e.external_examiner_id
      LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id
      WHERE e.status != 'draft'
      ORDER BY e.created_at DESC
      LIMIT 4
    `);

        res.json({
            stats: rows[0],
            alerts: {
                pending_beyond_limit: parseInt(alerts.rows[0].pending_beyond_limit || 0),
                repeated_rejections: parseInt(alerts.rows[0].repeated_rejections || 0),
                external_without_docs: parseInt(alerts.rows[0].external_without_docs || 0),
                rate_mismatch_flags: parseInt(alerts.rows[0].rate_mismatch_flags || 0)
            },
            department_expenditures: deptExpenditures.rows,
            recent_claims: recentClaims.rows
        });
    } catch (error) {
        console.error("getDashboardStats error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
};

/* ==============================
   GET ALL CLAIMS (WITH FILTERS)
================================ */
exports.getAllClaims = async (req, res) => {
    try {
        const { status, department, exam_type, academic_year, claim_form_type, rejection_history } = req.query;

        let where = [];
        let params = [];
        let paramIndex = 1;

        if (status) {
            where.push(`e.status = $${paramIndex++}`);
            params.push(status);
        }

        if (rejection_history === 'true') {
            where.push(`EXISTS (SELECT 1 FROM claim_actions ca WHERE ca.exam_id = e.id AND ca.action_type = 'REJECTED')`);
        }

        if (department) {
            where.push(`u.department = $${paramIndex++}`);
            params.push(department);
        }

        if (exam_type) {
            where.push(`e.exam_type = $${paramIndex++}`);
            params.push(exam_type);
        }

        if (academic_year) {
            where.push(`e.academic_year = $${paramIndex++}`);
            params.push(academic_year);
        }

        if (claim_form_type) {
            where.push(`e.claim_form_type = $${paramIndex++}`);
            params.push(claim_form_type);
        }

        // Always exclude draft claims from admin view
        where.push("e.status != 'draft'");
        const whereClause = `WHERE ${where.join(' AND ')}`;

        const { rows } = await pool.query(
            `
      SELECT
        e.id,
        e.claim_form_type,
        e.exam_type,
        e.subject_name,
        e.program,
        e.level,
        e.status,
        e.created_at,
        e.updated_at,
        CASE 
          WHEN e.claim_form_type = 'TEACHING_EXTERNAL' THEN ex.full_name 
          ELSE u.name 
        END AS claimant_name,
        u.name AS faculty_name,
        u.department,
        rc.total_amount,
        rc.net_amount,
        rc.min_applied
      FROM exams e
      JOIN users u ON u.id = e.faculty_id
      LEFT JOIN external_examiners ex ON ex.id = e.external_examiner_id
      LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id
      ${whereClause}
      ORDER BY e.created_at DESC
      `,
            params
        );

        res.json(rows);
    } catch (error) {
        console.error("getAllClaims error:", error);
        res.status(500).json({ message: "Failed to fetch claims" });
    }
};

/* ==============================
   GET CLAIM DETAILS
================================ */
exports.getClaimDetails = async (req, res) => {
    const examId = req.params.id;

    try {
        // Get exam details
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
        ee.full_name AS external_examiner_name,
        ee.email AS external_examiner_email,
        ee.mobile AS external_examiner_mobile,
        ee.parent_institute,
        ee.bank_name AS external_bank_name,
        ee.branch_name AS external_branch_name,
        ee.account_number AS external_account_number,
        ee.ifsc_code AS external_ifsc_code,
        ee.pan_number AS external_pan_number,
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

        // Get staff members with calculated amounts
        let staffData = [];
        if (examData.claim_form_type === 'NON_TEACHING') {
            const staff = await pool.query(
                `SELECT esm.*, srr.preparation_rate, srr.per_batch_rate, srr.cleaning_rate
                 FROM exam_staff_members esm
                 LEFT JOIN staff_role_rates srr 
                   ON esm.staff_role = srr.staff_role 
                   AND srr.academic_year = $2
                 WHERE esm.exam_id = $1 
                 ORDER BY esm.id`,
                [examId, examData.academic_year]
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

        // Get calculation details
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

        // Get audit logs (claim actions)
        const auditLogs = await pool.query(
            `SELECT ca.*, u.name AS action_by_name, u.role AS action_by_role
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
            auditLogs: auditLogs.rows
        });
    } catch (err) {
        console.error("getClaimDetails error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ==============================
   REJECT CLAIM (ADMIN)
================================ */
exports.rejectClaim = async (req, res) => {
    const examId = req.params.id;
    const { reason, policy_reference } = req.body;

    if (!reason || reason.trim() === '') {
        return res.status(400).json({ message: "Rejection reason is required" });
    }

    try {
        await pool.query("BEGIN");

        const result = await pool.query(
            `UPDATE exams SET status='rejected', updated_at=NOW() 
       WHERE id=$1 AND status IN ('submitted', 'approved', 'draft') 
       RETURNING id`,
            [examId]
        );

        if (result.rowCount === 0) {
            await pool.query("ROLLBACK");
            return res.status(400).json({ message: "Claim not found or cannot be rejected" });
        }

        const comment = policy_reference
            ? `${reason}\n\nPolicy Reference: ${policy_reference}`
            : reason;

        await pool.query(
            `INSERT INTO claim_actions
       (exam_id, action_by, action_role, action_type, comment)
       VALUES ($1, $2, 'ADMIN', 'REJECTED', $3)`,
            [examId, req.user.id, comment]
        );

        await pool.query("COMMIT");

        res.json({ message: "Claim rejected by Admin" });
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Admin reject claim error:", error);
        res.status(500).json({ message: "Failed to reject claim" });
    }
};

/* ==============================
   SEND BACK FOR CORRECTION
================================ */
exports.sendBackClaim = async (req, res) => {
    const examId = req.params.id;
    const { instructions } = req.body;

    if (!instructions || instructions.trim() === '') {
        return res.status(400).json({ message: "Correction instructions are required" });
    }

    try {
        await pool.query("BEGIN");

        const result = await pool.query(
            `UPDATE exams SET status='draft', updated_at=NOW() 
       WHERE id=$1 AND status IN ('submitted', 'approved') 
       RETURNING id`,
            [examId]
        );

        if (result.rowCount === 0) {
            await pool.query("ROLLBACK");
            return res.status(400).json({ message: "Claim not found or cannot be sent back" });
        }

        await pool.query(
            `INSERT INTO claim_actions
       (exam_id, action_by, action_role, action_type, comment)
       VALUES ($1, $2, 'ADMIN', 'SENT_BACK', $3)`,
            [examId, req.user.id, instructions]
        );

        await pool.query("COMMIT");

        res.json({ message: "Claim sent back for correction" });
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Admin send back claim error:", error);
        res.status(500).json({ message: "Failed to send back claim" });
    }
};

/* ==============================
   GET FACULTY PROFILE
================================ */
exports.getFacultyProfile = async (req, res) => {
    const facultyId = req.params.id;

    try {
        const user = await pool.query(
            `SELECT id, name, email, department, role, created_at, is_active, mobile, pan_card 
       FROM users WHERE id=$1 AND role='FACULTY'`,
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
        e.claim_form_type,
        e.status,
        e.created_at,
        rc.total_amount,
        rc.net_amount
      FROM exams e
      LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id
      WHERE e.faculty_id = $1 AND e.status != 'draft'
      ORDER BY e.created_at DESC`,
            [facultyId]
        );

        const rejectionHistory = await pool.query(
            `SELECT e.id, e.subject_name, ca.comment, ca.action_at
       FROM exams e
       JOIN claim_actions ca ON ca.exam_id = e.id
       WHERE e.faculty_id = $1 AND ca.action_type = 'REJECTED'
       ORDER BY ca.action_at DESC`,
            [facultyId]
        );

        const externalLinks = await pool.query(
            `SELECT e.id, e.subject_name, eel.token, eel.created_at, eel.expires_at, eel.used
       FROM exams e
       JOIN external_exam_links eel ON eel.exam_id = e.id
       WHERE e.faculty_id = $1 AND e.claim_form_type = 'TEACHING_EXTERNAL'
       ORDER BY eel.created_at DESC`,
            [facultyId]
        );

        res.json({
            faculty: user.rows[0],
            bank: bank.rows[0] || null,
            claims: claims.rows,
            rejectionHistory: rejectionHistory.rows,
            externalLinks: externalLinks.rows
        });
    } catch (error) {
        console.error("getFacultyProfile error:", error);
        res.status(500).json({ message: "Failed to fetch faculty profile" });
    }
};

/* ==============================
   GET BILLING_INCHARGE AUDIT
================================ */
exports.getBillingInchargeAudit = async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.department,
        COUNT(ca.id) FILTER (WHERE ca.action_type = 'APPROVED') AS approvals_count,
        COUNT(ca.id) FILTER (WHERE ca.action_type = 'REJECTED') AS rejections_count,
        COUNT(p.id) AS payments_count,
        COALESCE(SUM(p.amount), 0) AS total_paid_amount
      FROM users u
      LEFT JOIN claim_actions ca ON ca.action_by = u.id AND ca.action_role = 'BILLING_INCHARGE'
      LEFT JOIN payments p ON p.accountant_id = u.id
      WHERE u.role = 'BILLING_INCHARGE'
      GROUP BY u.id, u.name, u.department
      ORDER BY u.name
    `);

        res.json(rows);
    } catch (error) {
        console.error("getBillingInchargeAudit error:", error);
        res.status(500).json({ message: "Failed to fetch billing incharge audit" });
    }
};

/* ==============================
   GET BILLING_INCHARGE ACTIONS DETAIL
================================ */
exports.getBillingInchargeActions = async (req, res) => {
    const billingInchargeId = req.params.id;

    try {
        const actions = await pool.query(
            `SELECT
        ca.*,
        e.id AS exam_id,
        e.subject_name,
        e.exam_type,
        u.name AS faculty_name
      FROM claim_actions ca
      JOIN exams e ON e.id = ca.exam_id
      JOIN users u ON u.id = e.faculty_id
      WHERE ca.action_by = $1 AND ca.action_role = 'BILLING_INCHARGE'
      ORDER BY ca.action_at DESC`,
            [billingInchargeId]
        );

        const payments = await pool.query(
            `SELECT
        p.*,
        e.id AS exam_id,
        e.subject_name,
        u.name AS faculty_name
      FROM payments p
      JOIN exams e ON e.id = p.exam_id
      JOIN users u ON u.id = e.faculty_id
      WHERE p.accountant_id = $1
      ORDER BY p.payment_date DESC`,
            [billingInchargeId]
        );

        res.json({
            actions: actions.rows,
            payments: payments.rows
        });
    } catch (error) {
        console.error("getBillingInchargeActions error:", error);
        res.status(500).json({ message: "Failed to fetch billing incharge actions" });
    }
};

/* ==============================
   GET AUDIT LOGS (SYSTEM-WIDE)
================================ */
exports.getAuditLogs = async (req, res) => {
    try {
        const { exam_id, action_type, date_from, date_to } = req.query;

        let where = [];
        let params = [];
        let paramIndex = 1;

        if (exam_id) {
            where.push(`ca.exam_id = $${paramIndex++}`);
            params.push(exam_id);
        }

        if (action_type) {
            where.push(`ca.action_type = $${paramIndex++}`);
            params.push(action_type);
        }

        if (date_from) {
            where.push(`ca.action_at >= $${paramIndex++}`);
            params.push(date_from);
        }

        if (date_to) {
            where.push(`ca.action_at <= $${paramIndex++}`);
            params.push(date_to);
        }

        const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

        const { rows } = await pool.query(
            `SELECT
        ca.*,
        u.name AS action_by_name,
        e.subject_name,
        e.exam_type,
        f.name AS faculty_name
      FROM claim_actions ca
      JOIN users u ON u.id = ca.action_by
      JOIN exams e ON e.id = ca.exam_id
      JOIN users f ON f.id = e.faculty_id
      ${whereClause}
      ORDER BY ca.action_at DESC
      LIMIT 500`,
            params
        );

        res.json(rows);
    } catch (error) {
        console.error("getAuditLogs error:", error);
        res.status(500).json({ message: "Failed to fetch audit logs" });
    }
};

/* ==============================
   GET EXTERNAL EXAMINERS
================================ */
exports.getExternalExaminers = async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT DISTINCT ON (e.id)
        ee.id,
        ee.full_name,
        ee.email,
        ee.mobile,
        ee.parent_institute,
        ee.pan_number,
        ee.pan_document_url,
        ee.cancelled_cheque_url,
        ee.travel_proof_url,
        ee.is_local,
        ee.journey_days,
        ee.travel_allowance,
        e.id AS exam_id,
        e.subject_name,
        e.exam_type,
        e.program,
        e.level,
        e.status AS claim_status,
        u.name AS generated_by,
        u.department,
        eel.created_at AS link_created_at,
        eel.expires_at AS link_expires_at,
        eel.used AS link_used
      FROM external_examiners ee
      JOIN exams e ON e.external_examiner_id = ee.id
      JOIN users u ON u.id = e.faculty_id
      LEFT JOIN external_exam_links eel ON eel.exam_id = e.id
      WHERE e.claim_form_type = 'TEACHING_EXTERNAL' AND e.status != 'draft'
      ${req.user.role === 'BILLING_INCHARGE' ? 'AND u.department = $1' : ''}
      ORDER BY e.id DESC, eel.created_at DESC
    `, req.user.role === 'BILLING_INCHARGE' ? [req.user.department] : []);

        res.json(rows);
    } catch (error) {
        console.error("getExternalExaminers error:", error);
        res.status(500).json({ message: "Failed to fetch external examiners" });
    }
};

/* ==============================
   GET EXTERNAL LINK STATS (LEGACY - for link monitoring)
================================ */
exports.getExternalLinkStats = async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT
        eel.id,
        eel.token,
        eel.created_at,
        eel.expires_at,
        eel.used,
        e.id AS exam_id,
        e.subject_name,
        e.exam_type,
        e.status,
        u.name AS generated_by,
        u.department,
        ee.full_name AS external_examiner_name,
        ee.email AS external_examiner_email,
        ee.pan_document_url,
        ee.cancelled_cheque_url,
        ee.travel_proof_url
      FROM external_exam_links eel
      JOIN exams e ON e.id = eel.exam_id
      JOIN users u ON u.id = e.faculty_id
      LEFT JOIN external_examiners ee ON ee.id = e.external_examiner_id
      ${req.user.role === 'BILLING_INCHARGE' ? 'WHERE u.department = $1' : ''}
      ORDER BY eel.created_at DESC
    `, req.user.role === 'BILLING_INCHARGE' ? [req.user.department] : []);

        res.json(rows);
    } catch (error) {
        console.error("getExternalLinkStats error:", error);
        res.status(500).json({ message: "Failed to fetch external link stats" });
    }
};

/* ==============================
   GET EXTERNAL CLAIM DOCUMENTS
================================ */
exports.getExternalDocuments = async (req, res) => {
    const examId = req.params.id;

    try {
        const { rows } = await pool.query(
            `SELECT
        e.id,
        e.subject_name,
        e.exam_type,
        e.status,
        ee.full_name,
        ee.email,
        ee.mobile,
        ee.parent_institute,
        ee.pan_number,
        ee.pan_document_url,
        ee.cancelled_cheque_url,
        ee.travel_proof_url,
        ee.is_local,
        ee.journey_days,
        ee.travel_allowance
      FROM exams e
      LEFT JOIN external_examiners ee ON ee.id = e.external_examiner_id
      JOIN users u ON u.id = e.faculty_id
      WHERE e.id = $1 AND e.claim_form_type = 'TEACHING_EXTERNAL'
      ${req.user.role === 'BILLING_INCHARGE' ? 'AND u.department = $2' : ''}`,
            req.user.role === 'BILLING_INCHARGE' ? [examId, req.user.department] : [examId]
        );

        if (!rows.length) {
            return res.status(404).json({ message: "External claim not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("getExternalDocuments error:", error);
        res.status(500).json({ message: "Failed to fetch external documents" });
    }
};

/* ==============================
   LIST ALL FACULTY
================================ */
exports.listAllFaculty = async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.department,
        u.is_active,
        u.created_at,
        COUNT(e.id) FILTER (WHERE e.status != 'draft') AS total_claims,
        COUNT(e.id) FILTER (WHERE e.status = 'submitted') AS pending_claims,
        COUNT(e.id) FILTER (WHERE e.status = 'rejected') AS rejected_claims
      FROM users u
      LEFT JOIN exams e ON e.faculty_id = u.id
      WHERE u.role='FACULTY'
      GROUP BY u.id, u.name, u.email, u.department, u.created_at
      ORDER BY u.name
    `);

        res.json(rows);
    } catch (error) {
        console.error("listAllFaculty error:", error);
        res.status(500).json({ message: "Failed to fetch faculty list" });
    }
};

/* ==============================
   RATE MANAGEMENT
================================ */
exports.getAcademicYears = async (req, res) => {
    try {
        // Get distinct academic years from all rate tables
        const result = await pool.query(`
            SELECT DISTINCT academic_year 
            FROM (
                SELECT academic_year FROM remuneration_rates
                UNION
                SELECT academic_year FROM staff_role_rates
                UNION
                SELECT academic_year FROM batch_sizes
            ) AS years
            ORDER BY academic_year DESC
        `);

        res.json(result.rows.map(r => r.academic_year));
    } catch (error) {
        console.error("getAcademicYears error:", error);
        res.status(500).json({ message: "Failed to fetch academic years" });
    }
};

exports.getRates = async (req, res) => {
    try {
        const { academic_year } = req.query;
        const year = academic_year || '2024-25'; // Default to current year

        // Get teaching rates (remuneration_rates)
        const teachingRates = await pool.query(`
            SELECT * FROM remuneration_rates
            WHERE academic_year = $1
            ORDER BY exam_type
        `, [year]);

        // Get non-teaching rates (staff_role_rates)
        const staffRates = await pool.query(`
            SELECT * FROM staff_role_rates
            WHERE academic_year = $1
            ORDER BY staff_role
        `, [year]);

        // Get batch sizes
        const batchSizes = await pool.query(`
            SELECT * FROM batch_sizes
            WHERE academic_year = $1
            ORDER BY program
        `, [year]);

        res.json({
            academicYear: year,
            teachingRates: teachingRates.rows,
            staffRates: staffRates.rows,
            batchSizes: batchSizes.rows
        });
    } catch (error) {
        console.error("getRates error:", error);
        res.status(500).json({ message: "Failed to fetch rates" });
    }
};

exports.updateRates = async (req, res) => {
    const { teachingRates, staffRates, batchSizes, academic_year } = req.body;

    if (!academic_year) {
        return res.status(400).json({ message: "Academic year is required" });
    }

    try {
        await pool.query("BEGIN");

        // Update teaching rates
        if (teachingRates && Array.isArray(teachingRates)) {
            for (const rate of teachingRates) {
                await pool.query(
                    `UPDATE remuneration_rates 
                     SET fy_sy_rate = $1, ty_final_rate = $2, mtech_mca_rate = $3, min_per_day = $4
                     WHERE exam_type = $5 AND academic_year = $6`,
                    [rate.fy_sy_rate, rate.ty_final_rate, rate.mtech_mca_rate, rate.min_per_day, rate.exam_type, academic_year]
                );
            }
        }

        // Update staff rates
        if (staffRates && Array.isArray(staffRates)) {
            for (const rate of staffRates) {
                await pool.query(
                    `UPDATE staff_role_rates 
                     SET preparation_rate = $1, per_batch_rate = $2, cleaning_rate = $3
                     WHERE staff_role = $4 AND academic_year = $5`,
                    [rate.preparation_rate, rate.per_batch_rate, rate.cleaning_rate, rate.staff_role, academic_year]
                );
            }
        }

        // Update batch sizes
        if (batchSizes && Array.isArray(batchSizes)) {
            for (const batch of batchSizes) {
                await pool.query(
                    `UPDATE batch_sizes 
                     SET practical_size = $1, oral_size = $2, termwork_size = $3, 
                         project_oral_size = $4, dissertation_size = $5
                     WHERE program = $6 AND academic_year = $7`,
                    [
                        batch.practical_size,
                        batch.oral_size,
                        batch.termwork_size,
                        batch.project_oral_size,
                        batch.dissertation_size,
                        batch.program,
                        academic_year
                    ]
                );
            }
        }

        await pool.query("COMMIT");
        res.json({ message: `Rates updated successfully for ${academic_year}` });
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("updateRates error:", error);
        res.status(500).json({ message: "Failed to update rates" });
    }
};

exports.cloneRatesToNewYear = async (req, res) => {
    const { source_year, target_year } = req.body;

    if (!source_year || !target_year) {
        return res.status(400).json({ message: "Source year and target year are required" });
    }

    if (source_year === target_year) {
        return res.status(400).json({ message: "Source and target years must be different" });
    }

    try {
        await pool.query("BEGIN");

        // Check if target year already exists
        const existingCheck = await pool.query(
            `SELECT 1 FROM remuneration_rates WHERE academic_year = $1 LIMIT 1`,
            [target_year]
        );

        if (existingCheck.rows.length > 0) {
            await pool.query("ROLLBACK");
            return res.status(400).json({
                message: `Rates for ${target_year} already exist. Please delete them first or use the edit feature.`
            });
        }

        // Clone remuneration rates
        const remunerationResult = await pool.query(
            `INSERT INTO remuneration_rates (exam_type, fy_sy_rate, ty_final_rate, mtech_mca_rate, min_per_day, academic_year)
             SELECT exam_type, fy_sy_rate, ty_final_rate, mtech_mca_rate, min_per_day, $1
             FROM remuneration_rates
             WHERE academic_year = $2`,
            [target_year, source_year]
        );

        // Clone staff role rates
        const staffResult = await pool.query(
            `INSERT INTO staff_role_rates (staff_role, preparation_rate, per_batch_rate, cleaning_rate, academic_year)
             SELECT staff_role, preparation_rate, per_batch_rate, cleaning_rate, $1
             FROM staff_role_rates
             WHERE academic_year = $2`,
            [target_year, source_year]
        );

        // Clone batch sizes
        const batchResult = await pool.query(
            `INSERT INTO batch_sizes (program, practical_size, oral_size, termwork_size, project_oral_size, dissertation_size, academic_year)
             SELECT program, practical_size, oral_size, termwork_size, project_oral_size, dissertation_size, $1
             FROM batch_sizes
             WHERE academic_year = $2`,
            [target_year, source_year]
        );

        await pool.query("COMMIT");

        res.json({
            message: `Successfully cloned rates from ${source_year} to ${target_year}`,
            cloned: {
                teachingRates: remunerationResult.rowCount,
                staffRates: staffResult.rowCount,
                batchSizes: batchResult.rowCount
            }
        });
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("cloneRatesToNewYear error:", error);
        res.status(500).json({ message: "Failed to clone rates to new year" });
    }
};

/* ==============================
   USER MANAGEMENT (ADMIN)
================================ */
exports.createUser = async (req, res) => {
    const { name, email, password, role, department } = req.body;

    // Validation
    if (!name || !email || !password || !role || !department) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (!['FACULTY', 'BILLING_INCHARGE'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Only FACULTY and BILLING_INCHARGE can be created by Admin" });
    }

    if (!email.endsWith('@pccoepune.org')) {
        return res.status(400).json({ message: "Email must be from @pccoepune.org domain" });
    }

    try {
        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        // Hash password
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await pool.query(
            `INSERT INTO users (name, email, password, role, department, is_active, has_set_password)
             VALUES ($1, $2, $3, $4, $5, true, true)`,
            [name, email, hashedPassword, role, department]
        );

        res.status(201).json({ message: `${role} user created successfully` });
    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({ message: "Failed to create user" });
    }
};

exports.getUsersByRole = async (req, res) => {
    try {
        const { role } = req.query;

        let query = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.role, 
                u.department, 
                u.is_active, 
                u.created_at,
                COUNT(e.id) FILTER (WHERE e.status != 'draft') AS total_claims
            FROM users u
            LEFT JOIN exams e ON e.faculty_id = u.id
        `;

        const params = [];
        if (role) {
            query += ` WHERE u.role = $1`;
            params.push(role);
        } else {
            query += ` WHERE u.role IN ('FACULTY', 'BILLING_INCHARGE', 'ADMIN')`;
        }

        query += ` GROUP BY u.id, u.name, u.email, u.role, u.department, u.is_active, u.created_at
                   ORDER BY u.created_at DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

exports.toggleUserStatus = async (req, res) => {
    const { userId } = req.params;
    const { is_active } = req.body;

    try {
        const result = await pool.query(
            `UPDATE users SET is_active = $1 WHERE id = $2 AND role IN ('FACULTY', 'BILLING_INCHARGE') RETURNING id`,
            [is_active, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "User not found or cannot be modified" });
        }

        res.json({ message: `User ${is_active ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
        console.error("Toggle user status error:", error);
        res.status(500).json({ message: "Failed to update user status" });
    }
};

exports.resetUserPassword = async (req, res) => {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    try {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await pool.query(
            `UPDATE users SET password = $1 WHERE id = $2 AND role IN ('FACULTY', 'BILLING_INCHARGE') RETURNING id`,
            [hashedPassword, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "User not found or cannot be modified" });
        }

        res.json({ message: "User password reset successfully" });
    } catch (error) {
        console.error("Reset user password error:", error);
        res.status(500).json({ message: "Failed to reset password" });
    }
};
