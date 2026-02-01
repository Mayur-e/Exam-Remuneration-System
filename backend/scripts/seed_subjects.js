const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    max: 1
});

const filePath = path.join(__dirname, '../../README_SUBJECTS.md');

async function seedSubjects() {
    let client;
    try {
        console.log("Connecting to database...");
        client = await pool.connect();
        console.log("Connected.");

        console.log("Reading file from:", filePath);
        const data = fs.readFileSync(filePath, 'utf8');

        const lines = data.split('\n');
        let count = 0;

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                if (trimmed.includes('---')) continue;
                if (trimmed.includes('Subject Name') && trimmed.includes('Course Code')) continue;

                const parts = trimmed.split('|').map(p => p.trim());

                if (parts.length < 5) continue;

                const name = parts[1];
                const codeRaw = parts[2];
                const department = parts[3];
                const type = parts[4];

                if (!name || !codeRaw || name === 'Subject Name') continue;

                const codes = codeRaw.split('/').map(c => c.trim());

                for (const code of codes) {
                    if (!code || code === '-') continue;

                    const query = `
                INSERT INTO subjects (code, name, department, type)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (code) DO UPDATE SET
                    name = EXCLUDED.name,
                    department = EXCLUDED.department,
                    type = EXCLUDED.type;
            `;

                    try {
                        await client.query(query, [code, name, department, type]);
                        count++;
                        if (count % 20 === 0) process.stdout.write('.');
                    } catch (dbErr) {
                        console.error(`\nFailed to insert ${code}:`, dbErr.message);
                    }
                }
            }
        }

        console.log(`\n\nSuccessfully seeded ${count} subjects.`);

    } catch (err) {
        console.error("\nError seeding subjects:", err);
    } finally {
        if (client) client.release();
        await pool.end();
        process.exit(0);
    }
}

seedSubjects();
