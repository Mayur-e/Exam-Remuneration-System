const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: 5432,
});

async function run() {
    try {
        const res = await pool.query("SELECT id, status, faculty_id FROM exams ORDER BY id DESC LIMIT 20");
        console.log("Recent Exams Statuses:", JSON.stringify(res.rows, null, 2));

        const facultyStats = await pool.query(`
      SELECT
        faculty_id,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
        COUNT(*) FILTER (WHERE status = 'submitted') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count
      FROM exams
      GROUP BY faculty_id
    `);
        console.log("Faculty Stats Raw:", JSON.stringify(facultyStats.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
