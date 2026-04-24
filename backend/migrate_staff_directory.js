/**
 * migrate_staff_directory.js
 *
 * 1. Inserts all 73 people into staff_directory (for searchability in forms)
 * 2. Deletes non-faculty designations from the users table (removes their login)
 *    - Keeps: Assistant Professor, Associate Professor, Professor, Professor & HOD, Professor, Dean Academics
 *    - Removes: Lab Assistant, Attendant, Technical Assistant, Lab Attendant, Peon, Senior Clerk, Teaching Assistant, Visiting
 *
 * Run: node migrate_staff_directory.js
 */
require('dotenv').config();
const { Pool } = require('pg');
const XLSX = require('xlsx');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Designations that should keep LOGIN access (in users table)
const FACULTY_DESIGNATIONS = [
  'assistant professor',
  'associate professor',
  'professor',
  'professor & hod',
  'professor, dean academics',
  'visiting',  // keep visiting faculty login too
];

function isFacultyDesignation(designation) {
  if (!designation) return false;
  const d = String(designation).trim().toLowerCase();
  return FACULTY_DESIGNATIONS.some(fd => d.includes(fd) || fd.includes(d));
}

function cleanMobile(mobile) {
  if (!mobile) return null;
  return String(mobile).replace(/\D/g, '').slice(0, 15) || null;
}

function cleanPan(pan) {
  if (!pan) return null;
  return String(pan).trim().toUpperCase() || null;
}

async function main() {
  const xlsxPath = path.resolve(__dirname, '../Comp_ALL_Faculty_details.xlsx');
  console.log(`📂 Reading: ${xlsxPath}\n`);

  const wb = XLSX.readFile(xlsxPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const dataRows = rows.slice(1);

  const COL = { SR: 0, EMP_CODE: 1, NAME: 2, EMAIL: 4, MOBILE: 5, DESIGNATION: 9, DEPT: 10, PAN: 20 };

  let dirInserted = 0, dirSkipped = 0;
  let usersDeleted = 0;
  const removedLogins = [];
  const keptLogins = [];

  for (const row of dataRows) {
    const name = row[COL.NAME];
    const email = row[COL.EMAIL];
    const empCode = String(row[COL.EMP_CODE] || '').trim();
    const designation = row[COL.DESIGNATION];
    const dept = row[COL.DEPT] || 'Computer Engineering';
    const mobile = cleanMobile(row[COL.MOBILE]);
    const pan = cleanPan(row[COL.PAN]);

    if (!email || !String(email).endsWith('@pccoepune.org')) continue;
    if (!name || String(name).startsWith('NA')) continue;

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();
    const cleanDesig = String(designation || '').trim();

    // --- Populate staff_directory ---
    const existingDir = await pool.query('SELECT id FROM staff_directory WHERE LOWER(email) = $1', [cleanEmail]);
    if (existingDir.rows.length === 0) {
      await pool.query(
        `INSERT INTO staff_directory (name, email, mobile, designation, department, emp_code, pan_card)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [cleanName, cleanEmail, mobile, cleanDesig, dept, empCode, pan]
      );
      dirInserted++;
      console.log(`📋 Directory +: ${cleanName} (${cleanDesig})`);
    } else {
      dirSkipped++;
    }

    // --- Handle users table ---
    const isFaculty = isFacultyDesignation(cleanDesig);
    if (!isFaculty) {
      // Delete from users if they have a login
      const userRow = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (userRow.rows.length > 0) {
        await pool.query('DELETE FROM users WHERE LOWER(email) = $1', [cleanEmail]);
        usersDeleted++;
        removedLogins.push({ name: cleanName, email: cleanEmail, designation: cleanDesig });
        console.log(`❌ Login REMOVED: ${cleanName} (${cleanDesig})`);
      }
    } else {
      keptLogins.push({ name: cleanName, email: cleanEmail, designation: cleanDesig });
    }
  }

  console.log('\n========================================');
  console.log(`📋 staff_directory inserts : ${dirInserted} (${dirSkipped} already existed)`);
  console.log(`❌ Login accounts removed  : ${usersDeleted}`);
  console.log(`✅ Faculty logins kept     : ${keptLogins.length}`);
  console.log('========================================\n');

  if (removedLogins.length > 0) {
    console.log('Removed login accounts:');
    removedLogins.forEach(r => console.log(`  - ${r.name.padEnd(35)} [${r.designation}]`));
  }

  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
