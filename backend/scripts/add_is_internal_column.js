// Script to add is_internal column to exam_staff_members table
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ERMS',
    password: '',
    port: 5432,
});

async function addIsInternalColumn() {
    try {
        console.log('Adding is_internal column to exam_staff_members table...');

        // Add is_internal column
        await pool.query(`
      ALTER TABLE exam_staff_members
      ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT false;
    `);
        console.log('✓ Column is_internal added successfully');

        // Add comment
        await pool.query(`
      COMMENT ON COLUMN exam_staff_members.is_internal IS 'True if staff member is internal faculty (auto-created Expert Assistant for NON_TEACHING claims)';
    `);
        console.log('✓ Comment added successfully');

        // Create index
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_exam_staff_members_internal 
      ON exam_staff_members(exam_id, is_internal) 
      WHERE is_internal = true;
    `);
        console.log('✓ Index created successfully');

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

addIsInternalColumn()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
