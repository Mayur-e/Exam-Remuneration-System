const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD || ''),
  port: process.env.DB_PORT || 5432,
});

async function cleanupDuplicateDrafts() {
  try {
    console.log('🔍 Checking for duplicate drafts...');

    // First, show current duplicates
    const checkDuplicates = await pool.query(`
      SELECT 
        faculty_id,
        exam_type,
        subject_name,
        claim_form_type,
        COUNT(*) as count
      FROM exams
      WHERE status = 'draft'
      GROUP BY faculty_id, exam_type, subject_name, claim_form_type
      HAVING COUNT(*) > 1
    `);

    if (checkDuplicates.rows.length === 0) {
      console.log('✅ No duplicate drafts found!');
      await pool.end();
      return;
    }

    console.log(`\n⚠️  Found ${checkDuplicates.rows.length} sets of duplicate drafts:`);
    checkDuplicates.rows.forEach(row => {
      console.log(`   - ${row.subject_name} (${row.exam_type}, ${row.claim_form_type}): ${row.count} duplicates`);
    });

    console.log('\n🧹 Cleaning up duplicates (keeping most recent)...');

    // Delete duplicates, keeping only the most recent one
    const deleteResult = await pool.query(`
      WITH duplicates AS (
        SELECT 
          id,
          faculty_id,
          exam_type,
          subject_name,
          subject_code,
          claim_form_type,
          created_at,
          ROW_NUMBER() OVER (
            PARTITION BY faculty_id, exam_type, subject_name, subject_code, claim_form_type, status
            ORDER BY created_at DESC
          ) as row_num
        FROM exams
        WHERE status = 'draft'
      )
      DELETE FROM exams
      WHERE id IN (
        SELECT id 
        FROM duplicates 
        WHERE row_num > 1
      )
      RETURNING id
    `);

    console.log(`✅ Deleted ${deleteResult.rowCount} duplicate draft(s)`);

    // Verify cleanup
    const verifyResult = await pool.query(`
      SELECT 
        faculty_id,
        exam_type,
        subject_name,
        claim_form_type,
        COUNT(*) as count
      FROM exams
      WHERE status = 'draft'
      GROUP BY faculty_id, exam_type, subject_name, claim_form_type
      HAVING COUNT(*) > 1
    `);

    if (verifyResult.rows.length === 0) {
      console.log('✅ Cleanup successful! No more duplicates.');
    } else {
      console.log('⚠️  Some duplicates still remain:', verifyResult.rows);
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error cleaning up duplicates:', error);
    await pool.end();
    process.exit(1);
  }
}

cleanupDuplicateDrafts();
