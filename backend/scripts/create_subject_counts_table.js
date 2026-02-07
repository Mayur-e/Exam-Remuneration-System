require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.PORT,
});

async function createSubjectCountsTable() {
  try {
    console.log('Creating subject_semester_counts table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subject_semester_counts (
        id SERIAL PRIMARY KEY,
        subject_code VARCHAR(20) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        semester VARCHAR(20) NOT NULL,
        registered_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT subject_semester_counts_unique UNIQUE (subject_code, academic_year, semester),
        CONSTRAINT subject_semester_counts_count_check CHECK (registered_count >= 0)
      );
    `);

    console.log('✅ Table created successfully!');

    // Create index for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_subject_semester_counts_lookup 
      ON subject_semester_counts (subject_code, academic_year, semester);
    `);

    console.log('✅ Index created successfully!');

    await pool.end();
  } catch (error) {
    console.error('❌ Error creating table:', error);
    await pool.end();
    process.exit(1);
  }
}

createSubjectCountsTable();
