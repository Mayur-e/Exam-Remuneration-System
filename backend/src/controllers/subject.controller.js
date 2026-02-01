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
