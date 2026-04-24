/**
 * staff_directory.controller.js
 * 
 * Provides a searchable staff directory endpoint used in:
 *  - Non-teaching "Add Staff" form (staff_name field)
 *  - Teaching "Second Examiner" field
 */

const pool = require('../config/db');

// GET /api/staff-directory/search?q=<query>&type=faculty|all
// type=faculty  → only teaching designations (default for second_examiner)
// type=all      → all staff including non-teaching (for add staff form)
exports.search = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const type = req.query.type || 'faculty'; // 'faculty' or 'all'

    if (q.length < 1) {
      return res.json([]);
    }

    let query, params;

    if (type === 'all') {
      // Return all staff matching the search (for non-teaching staff form)
      query = `
        SELECT id, name, email, designation, department
        FROM staff_directory
        WHERE LOWER(name) LIKE $1
        ORDER BY
          CASE
            WHEN LOWER(designation) LIKE '%professor%' THEN 0
            WHEN LOWER(designation) LIKE '%assistant%' THEN 1
            ELSE 2
          END,
          name
        LIMIT 20
      `;
      params = [`%${q.toLowerCase()}%`];
    } else {
      // Only teaching faculty (for second examiner search)
      query = `
        SELECT id, name, email, designation, department
        FROM staff_directory
        WHERE LOWER(name) LIKE $1
          AND (
            LOWER(designation) LIKE '%professor%'
            OR LOWER(designation) = 'visiting'
          )
        ORDER BY name
        LIMIT 20
      `;
      params = [`%${q.toLowerCase()}%`];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Staff directory search error:', err);
    res.status(500).json({ message: 'Search failed' });
  }
};
