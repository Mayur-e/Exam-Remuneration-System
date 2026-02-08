// Script to check staff_role_rates table structure
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ERMS',
    password: 'Mayur123',
    port: 5432,
});

async function checkStaffRoleRates() {
    try {
        console.log('Checking staff_role_rates table structure...\n');

        const structure = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'staff_role_rates'
      ORDER BY ordinal_position;
    `);

        console.log('Table structure:');
        console.table(structure.rows);

        console.log('\nSample data:');
        const data = await pool.query(`SELECT * FROM staff_role_rates LIMIT 5;`);
        console.table(data.rows);

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

checkStaffRoleRates()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
