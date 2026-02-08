// Script to add rate column to exam_staff_members table
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ERMS',
    password: 'Mayur123',
    port: 5432,
});

async function addRateColumn() {
    try {
        console.log('Adding rate column to exam_staff_members table...');

        // Add rate column
        await pool.query(`
      ALTER TABLE exam_staff_members
      ADD COLUMN IF NOT EXISTS rate NUMERIC(10,2) DEFAULT 0;
    `);
        console.log('✓ Column rate added successfully');

        // Add comment
        await pool.query(`
      COMMENT ON COLUMN exam_staff_members.rate IS 'Rate per day for the staff member';
    `);
        console.log('✓ Comment added successfully');

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

addRateColumn()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
