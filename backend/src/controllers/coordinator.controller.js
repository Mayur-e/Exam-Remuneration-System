const pool = require("../config/db");

/**
 * Assign Self as Course Coordinator
 */
exports.assignCoordinator = async (req, res) => {
    const { course_id, academic_year, semester } = req.body;
    const faculty_id = req.user.id;

    if (!course_id || !academic_year || !semester) {
        return res.status(400).json({ message: "Course, Academic Year and Semester are required" });
    }

    try {
        // 1. Check if course exists
        const courseCheck = await pool.query("SELECT id FROM subjects WHERE id = $1", [course_id]);
        if (courseCheck.rows.length === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        // 2. Check if Faculty is already assigned as coordinator for any subject in this term
        // Restriction: A faculty can be Course Coordinator for only ONE subject at a time per term
        const facultyCheck = await pool.query(
            `SELECT id FROM course_assignments 
       WHERE faculty_id = $1 AND academic_year = $2 AND semester = $3 AND is_active = true`,
            [faculty_id, academic_year, semester]
        );

        if (facultyCheck.rows.length > 0) {
            return res.status(400).json({
                message: "You are already assigned as a Course Coordinator for another subject in this semester."
            });
        }

        // 3. Check if Course already has a coordinator for this term
        const courseAssignCheck = await pool.query(
            `SELECT u.name FROM course_assignments ca
       JOIN users u ON ca.faculty_id = u.id
       WHERE ca.course_id = $1 AND ca.academic_year = $2 AND ca.semester = $3 AND ca.is_active = true`,
            [course_id, academic_year, semester]
        );

        if (courseAssignCheck.rows.length > 0) {
            const currentCoordinator = courseAssignCheck.rows[0].name;
            return res.status(400).json({
                message: `This course is already assigned to ${currentCoordinator} for this semester.`
            });
        }

        // 4. Assign
        await pool.query(
            `INSERT INTO course_assignments (course_id, faculty_id, academic_year, semester)
       VALUES ($1, $2, $3, $4)`,
            [course_id, faculty_id, academic_year, semester]
        );

        res.status(201).json({ message: "Successfully assigned as Course Coordinator" });

    } catch (error) {
        console.error("Assign Coordinator Error:", error);
        res.status(500).json({ message: "Failed to assign coordinator" });
    }
};

/**
 * Get Coordinator Assignments (Active)
 */
exports.getMyAssignments = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ca.id, c.code, c.name, ca.academic_year, ca.semester, ca.created_at
       FROM course_assignments ca
       JOIN subjects c ON ca.course_id = c.id
       WHERE ca.faculty_id = $1 AND ca.is_active = true
       ORDER BY ca.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Get Assignments Error:", error);
        res.status(500).json({ message: "Failed to fetch assignments" });
    }
};

/**
 * Get Full Claim Details (Coordinator View - read-only)
 */
exports.getCoordinatorClaimDetails = async (req, res) => {
    const examId = req.params.id;
    const coordinatorId = req.user.id;

    try {
        // Verify the coordinator has access to this exam via their course assignment
        const accessCheck = await pool.query(
            `SELECT e.id FROM exams e
             JOIN course_assignments ca ON 
               ca.course_id = e.course_id AND
               ca.academic_year = e.academic_year AND
               ca.semester = e.semester
             WHERE e.id = $1 AND ca.faculty_id = $2 AND ca.is_active = true`,
            [examId, coordinatorId]
        );

        if (accessCheck.rows.length === 0) {
            return res.status(403).json({ message: "Not authorized to view this claim" });
        }

        const exam = await pool.query(
            `SELECT
                e.*,
                u.name AS faculty_name,
                u.email AS faculty_email,
                u.department AS faculty_department,
                u.mobile AS faculty_mobile,
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
                ee.travel_allowance
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

        // Get staff members
        const staff = await pool.query(
            `SELECT * FROM exam_staff_members WHERE exam_id = $1 ORDER BY id`,
            [examId]
        );

        // Get remuneration calculation
        const calc = await pool.query(
            `SELECT * FROM remuneration_calculations WHERE exam_id = $1`,
            [examId]
        );

        // Get action history
        const actions = await pool.query(
            `SELECT ca.*, u.name AS action_by_name, u.role AS action_by_role
             FROM claim_actions ca
             JOIN users u ON ca.action_by = u.id
             WHERE ca.exam_id = $1
             ORDER BY ca.action_at DESC`,
            [examId]
        );

        res.json({
            exam: examData,
            staff: staff.rows,
            calculation: calc.rows[0] || null,
            actions: actions.rows
        });

    } catch (error) {
        console.error("getCoordinatorClaimDetails error:", error);
        res.status(500).json({ message: "Failed to fetch claim details" });
    }
};

/**
 * Get Claims for Review (Coordinator View)
 */
exports.getCoordinatorClaims = async (req, res) => {
    try {
        // Fetch claims where the exam's course, year, and semester match an active assignment of the logged-in user
        const result = await pool.query(
            `SELECT 
        e.id, 
        e.exam_type, 
        e.claim_form_type,
        e.subject_code, 
        e.subject_name, 
        e.students_count, 
        e.exam_date,
        e.status,
        e.created_at,
        CASE 
          WHEN e.claim_form_type = 'TEACHING_EXTERNAL' THEN ex.full_name 
          ELSE u.name 
        END AS faculty_name,
        c.name as course_name,
        (SELECT COALESCE(remarks, comment) 
         FROM claim_actions 
         WHERE exam_id = e.id 
           AND action_type IN ('REJECT', 'REJECTED') 
         ORDER BY action_at DESC LIMIT 1) as rejection_reason
       FROM exams e
       JOIN users u ON e.faculty_id = u.id
       LEFT JOIN external_examiners ex ON e.external_examiner_id = ex.id
       LEFT JOIN subjects c ON e.course_id = c.id
       JOIN course_assignments ca ON 
          ca.course_id = e.course_id AND 
          ca.academic_year = e.academic_year AND 
          ca.semester = e.semester
        WHERE ca.faculty_id = $1 
          AND ca.is_active = true
          AND e.status IN ('UNDER_COORDINATOR_REVIEW', 'COORDINATOR_VERIFIED', 'SENT_TO_BILLING', 'approved', 'paid', 'rejected', 'COORDINATOR_REJECTED')
        ORDER BY 
          CASE 
            WHEN e.status = 'UNDER_COORDINATOR_REVIEW' THEN 1
            WHEN e.status = 'COORDINATOR_VERIFIED' THEN 2
            ELSE 3
          END,
          e.created_at ASC`,
            [req.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Get Coordinator Claims Error:", error);
        res.status(500).json({ message: "Failed to fetch claims" });
    }
};

/**
 * Verify Claim (Approve)
 */
exports.verifyClaim = async (req, res) => {
    const { examId } = req.body; // or params
    const coordinatorId = req.user.id;

    if (!examId) return res.status(400).json({ message: "Exam ID is required" });

    try {
        // Verify permission (Double check)
        const accessCheck = await pool.query(
            `SELECT e.id FROM exams e
       JOIN course_assignments ca ON 
          ca.course_id = e.course_id AND 
          ca.academic_year = e.academic_year AND 
          ca.semester = e.semester
       WHERE e.id = $1 AND ca.faculty_id = $2 AND e.status = 'UNDER_COORDINATOR_REVIEW'`,
            [examId, coordinatorId]
        );

        if (accessCheck.rows.length === 0) {
            return res.status(403).json({ message: "Not authorized or claim not in review" });
        }

        await pool.query('BEGIN');

        // Update Status to intermediate verified state
        await pool.query(
            `UPDATE exams SET status = 'COORDINATOR_VERIFIED', updated_at = NOW() WHERE id = $1`,
            [examId]
        );

        // Log Action
        await pool.query(
            `INSERT INTO claim_actions (exam_id, action_by, action_role, action_type, remarks)
       VALUES ($1, $2, 'COORDINATOR', 'VERIFY', 'Verified by Coordinator')`,
            [examId, coordinatorId]
        );

        await pool.query('COMMIT');
        res.json({ message: "Claim verified locally" });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Verify Claim Error:", error);
        res.status(500).json({ message: "Failed to verify claim" });
    }
};

/**
 * Batch Submit Verified Claims to Billing
 */
exports.submitToBilling = async (req, res) => {
    const coordinatorId = req.user.id;

    try {
        await pool.query('BEGIN');

        // Update all COORDINATOR_VERIFIED claims for this coordinator to SENT_TO_BILLING
        const result = await pool.query(
            `UPDATE exams e
             SET status = 'SENT_TO_BILLING', updated_at = NOW()
             FROM course_assignments ca
             WHERE ca.course_id = e.course_id 
               AND ca.academic_year = e.academic_year 
               AND ca.semester = e.semester
               AND ca.faculty_id = $1
               AND e.status = 'COORDINATOR_VERIFIED'
             RETURNING e.id`,
            [coordinatorId]
        );

        if (result.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ message: "No verified claims found to submit" });
        }

        // Log batch action
        for (const row of result.rows) {
            await pool.query(
                `INSERT INTO claim_actions (exam_id, action_by, action_role, action_type, remarks)
                 VALUES ($1, $2, 'COORDINATOR', 'SUBMIT_TO_BILLING', 'Submitted to Billing Incharge')`,
                [row.id, coordinatorId]
            );
        }

        await pool.query('COMMIT');
        res.json({ message: `Successfully submitted ${result.rows.length} claims to Billing Incharge` });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Submit to Billing Error:", error);
        res.status(500).json({ message: "Failed to submit claims to billing" });
    }
};

/**
 * Reject Claim
 */
exports.rejectClaim = async (req, res) => {
    const { examId, reason } = req.body;
    const coordinatorId = req.user.id;

    if (!examId || !reason) return res.status(400).json({ message: "Exam ID and rejection reason are required" });

    try {
        // Verify permission
        const accessCheck = await pool.query(
            `SELECT e.id FROM exams e
       JOIN course_assignments ca ON 
          ca.course_id = e.course_id AND 
          ca.academic_year = e.academic_year AND 
          ca.semester = e.semester
       WHERE e.id = $1 AND ca.faculty_id = $2 AND e.status = 'UNDER_COORDINATOR_REVIEW'`,
            [examId, coordinatorId]
        );

        if (accessCheck.rows.length === 0) {
            return res.status(403).json({ message: "Not authorized or claim not in review" });
        }

        await pool.query('BEGIN');

        // Update Status
        await pool.query(
            `UPDATE exams SET status = 'COORDINATOR_REJECTED', updated_at = NOW() WHERE id = $1`,
            [examId]
        );

        // Log Action
        await pool.query(
            `INSERT INTO claim_actions (exam_id, action_by, action_role, action_type, remarks)
       VALUES ($1, $2, 'COORDINATOR', 'REJECT', $3)`,
            [examId, coordinatorId, reason]
        );

        await pool.query('COMMIT');
        res.json({ message: "Claim rejected" });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Reject Claim Error:", error);
        res.status(500).json({ message: "Failed to reject claim" });
    }
};

/**
 * Get Available Subjects for Assignment (Department based)
 */
exports.getDepartmentCourses = async (req, res) => {
    try {
        const { department } = req.query; // Optional filter? Or use user's department?
        const userDept = req.user.department;

        // If user has department, filter by it. Else return all? or return all for now.
        let query = "SELECT id, code, name, department FROM subjects";
        let params = [];

        if (userDept && userDept !== 'Admin') { // Assuming 'Admin' can see all
            query += " WHERE department = $1";
            params.push(userDept);
        }

        query += " ORDER BY code ASC";

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Get Courses Error:", error);
        res.status(500).json({ message: "Failed to fetch courses" });
    }
}

/* ==============================
   BILLING INCHARGE: COORDINATOR MANAGEMENT
================================ */
/**
 * Get All Coordinator Assignments (for Billing Incharge)
 */
exports.getAllCoordinatorAssignments = async (req, res) => {
    try {
        const userDepartment = req.user.department;

        const result = await pool.query(
            `SELECT 
                ca.id,
                ca.academic_year,
                ca.semester,
                ca.created_at,
                c.code as course_code,
                c.name as course_name,
                c.department,
                u.id as faculty_id,
                u.name as faculty_name,
                u.email as faculty_email,
                COUNT(e.id) FILTER (WHERE e.status IN ('UNDER_COORDINATOR_REVIEW', 'COORDINATOR_VERIFIED')) as pending_claims
            FROM course_assignments ca
            JOIN subjects c ON ca.course_id = c.id
            JOIN users u ON ca.faculty_id = u.id
            LEFT JOIN exams e ON e.course_id = ca.course_id 
                AND e.academic_year = ca.academic_year 
                AND e.semester = ca.semester
            WHERE ca.is_active = true AND c.department = $1
            GROUP BY ca.id, ca.academic_year, ca.semester, ca.created_at, c.code, c.name, c.department, u.id, u.name, u.email
            ORDER BY ca.created_at DESC`,
            [userDepartment]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Get All Coordinator Assignments Error:", error);
        res.status(500).json({ message: "Failed to fetch coordinator assignments" });
    }
};

/**
 * Revoke Coordinator Assignment (for Billing Incharge)
 */
exports.revokeCoordinator = async (req, res) => {
    const { assignmentId } = req.params;
    const { reason } = req.body;

    try {
        await pool.query('BEGIN');

        // Verify department access
        const assignmentCheck = await pool.query(
            `SELECT ca.id, c.department, u.name as faculty_name
             FROM course_assignments ca
             JOIN subjects c ON ca.course_id = c.id
             JOIN users u ON ca.faculty_id = u.id
             WHERE ca.id = $1 AND ca.is_active = true`,
            [assignmentId]
        );

        if (assignmentCheck.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: "Coordinator assignment not found or already revoked" });
        }

        const assignment = assignmentCheck.rows[0];

        if (assignment.department !== req.user.department) {
            await pool.query('ROLLBACK');
            return res.status(403).json({ message: "Access denied: This assignment belongs to a different department" });
        }

        // Revoke assignment
        await pool.query(
            `UPDATE course_assignments SET is_active = false, updated_at = NOW() WHERE id = $1`,
            [assignmentId]
        );

        // Log the action (optional - you can create a separate audit table if needed)
        console.log(`Billing Incharge ${req.user.name} revoked coordinator assignment ${assignmentId} for ${assignment.faculty_name}. Reason: ${reason || 'Not specified'}`);

        await pool.query('COMMIT');
        res.json({ message: "Coordinator assignment revoked successfully" });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Revoke Coordinator Error:", error);
        res.status(500).json({ message: "Failed to revoke coordinator assignment" });
    }
};

/**
 * Reassign Coordinator (for Billing Incharge)
 */
exports.reassignCoordinator = async (req, res) => {
    const { course_id, academic_year, semester, new_faculty_id } = req.body;

    if (!course_id || !academic_year || !semester || !new_faculty_id) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        await pool.query('BEGIN');

        // Verify department access
        const courseCheck = await pool.query(
            `SELECT department FROM subjects WHERE id = $1`,
            [course_id]
        );

        if (courseCheck.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: "Course not found" });
        }

        if (courseCheck.rows[0].department !== req.user.department) {
            await pool.query('ROLLBACK');
            return res.status(403).json({ message: "Access denied: This course belongs to a different department" });
        }

        // Check if new faculty exists and is in the same department
        const facultyCheck = await pool.query(
            `SELECT id FROM users WHERE id = $1 AND role = 'FACULTY' AND department = $2 AND is_active = true`,
            [new_faculty_id, req.user.department]
        );

        if (facultyCheck.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: "Faculty not found or not in your department" });
        }

        // Check if new faculty is already a coordinator for another subject in this term
        const existingAssignment = await pool.query(
            `SELECT id FROM course_assignments 
             WHERE faculty_id = $1 AND academic_year = $2 AND semester = $3 AND is_active = true`,
            [new_faculty_id, academic_year, semester]
        );

        if (existingAssignment.rows.length > 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ message: "This faculty is already a coordinator for another subject in this semester" });
        }

        // Deactivate current assignment
        await pool.query(
            `UPDATE course_assignments 
             SET is_active = false, updated_at = NOW() 
             WHERE course_id = $1 AND academic_year = $2 AND semester = $3 AND is_active = true`,
            [course_id, academic_year, semester]
        );

        // Create new assignment
        await pool.query(
            `INSERT INTO course_assignments (course_id, faculty_id, academic_year, semester)
             VALUES ($1, $2, $3, $4)`,
            [course_id, new_faculty_id, academic_year, semester]
        );

        await pool.query('COMMIT');
        res.json({ message: "Coordinator reassigned successfully" });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Reassign Coordinator Error:", error);
        res.status(500).json({ message: "Failed to reassign coordinator" });
    }
};

/**
 * Revoke Self Coordinator Assignment (for Faculty)
 */
exports.revokeSelfCoordinator = async (req, res) => {
    const { assignmentId } = req.params;
    const facultyId = req.user.id;

    try {
        await pool.query('BEGIN');

        // Verify assignment belongs to the requesting faculty and is active
        const assignmentCheck = await pool.query(
            `SELECT id FROM course_assignments 
             WHERE id = $1 AND faculty_id = $2 AND is_active = true`,
            [assignmentId, facultyId]
        );

        if (assignmentCheck.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: "Active assignment not found or you don't have permission" });
        }

        // Check if there are any *pending* claims verified by this coordinator that might block revocation?
        // Let's assume they can revoke anytime, and new claims will just need a new coordinator.

        // Revoke assignment
        await pool.query(
            `UPDATE course_assignments SET is_active = false, updated_at = NOW() WHERE id = $1`,
            [assignmentId]
        );

        await pool.query('COMMIT');
        res.json({ message: "Your coordinator assignment was successfully revoked" });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Revoke Self Coordinator Error:", error);
        res.status(500).json({ message: "Failed to revoke coordinator assignment" });
    }
};
