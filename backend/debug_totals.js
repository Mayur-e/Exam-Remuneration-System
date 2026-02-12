const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASS, port: 5432,
});

async function run() {
    try {
        const res = await pool.query(`
      SELECT e.id, e.status, rc.net_amount 
      FROM exams e 
      LEFT JOIN remuneration_calculations rc ON rc.exam_id = e.id 
      WHERE e.faculty_id = 5
    `);
        console.log("Faculty 5 Claims:", JSON.stringify(res.rows, null, 2));

        const sumAll = res.rows.reduce((sum, r) => sum + Number(r.net_amount || 0), 0);
        console.log("Sum All:", sumAll);

    } catch (err) { console.error(err); } finally { await pool.end(); }
}

run();
