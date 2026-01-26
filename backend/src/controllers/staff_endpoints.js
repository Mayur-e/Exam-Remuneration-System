
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
