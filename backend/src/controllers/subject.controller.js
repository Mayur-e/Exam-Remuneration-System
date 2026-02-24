const pool = require("../config/db");

exports.searchSubjects = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.json([]);
        }

        const searchQuery = `%${query}%`;
        const result = await pool.query(
            `SELECT code, name, department, type, year 
       FROM subjects 
       WHERE code ILIKE $1 OR name ILIKE $1 
       ORDER BY code ASC 
       LIMIT 20`,
            [searchQuery]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Search subjects error:", err);
        res.status(500).json({ message: "Failed to search subjects" });
    }
};

/**
 * Set/Update registered student count for a subject in a specific semester
 */
exports.setSubjectCount = async (req, res) => {
    try {
        const { subject_code, academic_year, semester, registered_count } = req.body;

        if (!subject_code || !academic_year || !semester || registered_count === undefined) {
            return res.status(400).json({
                message: "Subject code, academic year, semester, and registered count are required"
            });
        }

        // Verify subject exists
        const subjectCheck = await pool.query(
            `SELECT 1 FROM subjects WHERE code = $1 LIMIT 1`,
            [subject_code]
        );

        if (subjectCheck.rows.length === 0) {
            return res.status(404).json({
                message: `Subject with code "${subject_code}" not found`
            });
        }

        // Upsert the count
        await pool.query(
            `INSERT INTO subject_semester_counts 
             (subject_code, academic_year, semester, registered_count, updated_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
             ON CONFLICT (subject_code, academic_year, semester)
             DO UPDATE SET 
                registered_count = EXCLUDED.registered_count,
                updated_at = CURRENT_TIMESTAMP`,
            [subject_code, academic_year, semester, registered_count]
        );

        res.json({
            message: "Registered student count updated successfully",
            subject_code,
            academic_year,
            semester,
            registered_count
        });
    } catch (err) {
        console.error("Set subject count error:", err);
        res.status(500).json({ message: "Failed to update subject count", error: err.message, stack: err.stack });
    }
};

/**
 * Get registered student counts with optional filters
 */
/**
 * Get registered student counts with optional filters (Returns ALL subjects matching filters)
 */
exports.getSubjectCounts = async (req, res) => {
    try {
        const { subject_code, academic_year, semester } = req.query;

        let query = `
            SELECT 
                s.code as subject_code, 
                s.name as subject_name, 
                s.department,
                s.year,
                ssc.registered_count,
                ssc.academic_year,
                ssc.semester,
                ssc.updated_at,
                true as is_set
            FROM subject_semester_counts ssc
            JOIN subjects s ON s.code = ssc.subject_code 
        `;

        const params = [];
        let paramIndex = 1;
        let whereClauses = [];

        if (academic_year) {
            whereClauses.push(`ssc.academic_year = $${paramIndex++}`);
            params.push(academic_year);
        }

        if (semester) {
            whereClauses.push(`ssc.semester = $${paramIndex++}`);
            params.push(semester);
        }

        if (subject_code) {
            whereClauses.push(`(s.code ILIKE $${paramIndex} OR s.name ILIKE $${paramIndex})`);
            params.push(`%${subject_code}%`);
            paramIndex++;
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        query += ` ORDER BY s.code ASC LIMIT 100`;

        const result = await pool.query(query, params);

        res.json(result.rows);
    } catch (err) {
        console.error("Get subject counts error:", err);
        res.status(500).json({ message: "Failed to fetch subject counts" });
    }
};

