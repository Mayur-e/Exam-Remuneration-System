// Script to check exam_staff_members table structure
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ERMS',
    password: 'Mayur123',
    port: 5432,
});

async function checkTableStructure() {
    try {
        console.log('Checking exam_staff_members table structure...\n');

        const result = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'exam_staff_members'
      ORDER BY ordinal_position;
    `);

        console.log('Current columns:');
        console.table(result.rows);

        // Check specifically for rate and is_internal
        const hasRate = result.rows.some(row => row.column_name === 'rate');
        const hasIsInternal = result.rows.some(row => row.column_name === 'is_internal');

        console.log('\n✓ Has rate column:', hasRate);
        console.log('✓ Has is_internal column:', hasIsInternal);

        if (!hasRate || !hasIsInternal) {
            console.log('\n⚠️  Missing columns detected! Running migration...\n');

            if (!hasRate) {
                await pool.query(`
          ALTER TABLE exam_staff_members
          ADD COLUMN rate NUMERIC(10,2) DEFAULT 0;
        `);
                console.log('✓ Added rate column');
            }

            if (!hasIsInternal) {
                await pool.query(`
          ALTER TABLE exam_staff_members
          ADD COLUMN is_internal BOOLEAN DEFAULT false;
        `);
                console.log('✓ Added is_internal column');
            }

            console.log('\n✅ Migration completed!');
        } else {
            console.log('\n✅ All required columns exist!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

checkTableStructure()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
