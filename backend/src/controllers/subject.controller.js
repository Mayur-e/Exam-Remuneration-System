const pool = require("../config/db");

exports.searchSubjects = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.json([]);
        }

        const searchQuery = `%${query}%`;
        const result = await pool.query(
            `SELECT code, name, department, type 
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
        res.status(500).json({ message: "Failed to update subject count" });
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

        // If no academic_year is provided, default to current but we need one for the LEFT JOIN condition
        // However, if we want to show ALL subjects, we must filter on the LEFT JOINed table condition
        // structure: FROM subjects s LEFT JOIN subject_semester_counts ssc ON ... AND ssc.academic_year = $1 AND ssc.semester = $2

        let query = `
            SELECT 
                s.code as subject_code, 
                s.name as subject_name, 
                s.department,
                COALESCE(ssc.registered_count, 0) as registered_count,
                ssc.academic_year,
                ssc.semester,
                ssc.updated_at,
                CASE WHEN ssc.id IS NOT NULL THEN true ELSE false END as is_set
            FROM subjects s
            LEFT JOIN subject_semester_counts ssc 
                ON s.code = ssc.subject_code 
        `;

        const params = [];
        let paramIndex = 1;

        // We only apply the join condition filters if they are provided, 
        // to specifically look for counts in that year/sem.
        // If filters are missing, this might return multiple rows per subject (one for each year/sem it has a count for, plus one with NULL if it has no counts? No, LEFT JOIN logic is tricky here).

        // BETTER APPROACH for UI: 
        // The UI asks for a specific Academic Year and Semester to "edit" or "view".
        // So we should enforce or default Academic Year context.

        // If the user wants to see "Registered counts for 2024-25 Sem-I", 
        // we show ALL subjects, and the count if it exists for that year/sem.

        let joinConditions = [];

        if (academic_year) {
            joinConditions.push(`ssc.academic_year = $${paramIndex++}`);
            params.push(academic_year);
        }

        if (semester) {
            joinConditions.push(`ssc.semester = $${paramIndex++}`);
            params.push(semester);
        }

        if (joinConditions.length > 0) {
            // Append these to the ON clause so we get NULLs for subjects that don't match the year/sem
            query += ` AND ${joinConditions.join(' AND ')}`;
        }

        // Search query (WHERE clause on subjects table)
        let whereClauses = ["1=1"];

        if (subject_code) {
            whereClauses.push(`(s.code ILIKE $${paramIndex} OR s.name ILIKE $${paramIndex})`);
            params.push(`%${subject_code}%`);
            paramIndex++;
        }

        query += ` WHERE ${whereClauses.join(' AND ')}`;
        query += ` ORDER BY s.code ASC LIMIT 100`; // Limit to avoid overwhelming UI if too many subjects

        const result = await pool.query(query, params);

        // Transform result: If academic_year was requested but row has null (because left join failed), 
        // fill it in so UI knows which context we are looking at.
        const rows = result.rows.map(row => ({
            ...row,
            academic_year: row.academic_year || academic_year || null,
            semester: row.semester || semester || null,
            registered_count: row.registered_count // 0 if coalesced above
        }));

        res.json(rows);
    } catch (err) {
        console.error("Get subject counts error:", err);
        res.status(500).json({ message: "Failed to fetch subject counts" });
    }
};

