/**
 * seed_faculty_users.js
 * 
 * Reads Comp_ALL_Faculty_details.xlsx and inserts all faculty members
 * as FACULTY users in the ERMS database.
 * 
 * Password strategy: Last name (lowercase) + last 4 chars of employee code
 * Example: SHRADDHA VIJAY OVALE, code 20TCOMP1944 → password: ovale1944
 * 
 * Run: node seed_faculty_users.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const XLSX = require('xlsx');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Map designation → role (all are FACULTY since role check constraint only allows FACULTY/ADMIN/BILLING_INCHARGE)
function getRole(designation) {
  return 'FACULTY';
}

// Determine password: lastName (lowercase) + last 4 chars of employee code
function generatePassword(fullName, empCode) {
  const parts = fullName.trim().split(/\s+/);
  const lastName = parts[parts.length - 1].toLowerCase();
  const codeSuffix = String(empCode).slice(-4).toLowerCase();
  return `${lastName}${codeSuffix}`;
}

// Clean mobile number to max 15 chars
function cleanMobile(mobile) {
  if (!mobile) return null;
  const s = String(mobile).replace(/\D/g, '').slice(0, 15);
  return s || null;
}

// Clean PAN card
function cleanPan(pan) {
  if (!pan) return null;
  const s = String(pan).trim().toUpperCase();
  return s.length > 0 ? s : null;
}

async function main() {
  const xlsxPath = path.resolve(__dirname, '../Comp_ALL_Faculty_details.xlsx');
  console.log(`📂 Reading: ${xlsxPath}`);
  
  const wb = XLSX.readFile(xlsxPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  console.log(`📊 Found ${dataRows.length} faculty records\n`);
  
  // Column indices based on header
  const COL = {
    SR_NO: 0,
    EMP_CODE: 1,
    EMP_NAME: 2,
    EMAIL: 4,
    MOBILE: 5,
    DESIGNATION: 9,
    DEPARTMENT: 10,
    PAN: 20,
  };
  
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  
  const summary = [];
  
  for (const row of dataRows) {
    const name = row[COL.EMP_NAME];
    const email = row[COL.EMAIL];
    const empCode = row[COL.EMP_CODE];
    const mobile = cleanMobile(row[COL.MOBILE]);
    const designation = row[COL.DESIGNATION];
    const department = row[COL.DEPARTMENT] || 'Computer Engineering';
    const pan = cleanPan(row[COL.PAN]);
    
    // Skip rows without valid email
    if (!email || !String(email).endsWith('@pccoepune.org')) {
      continue;
    }
    
    // Skip placeholder rows
    if (!name || String(name).trim() === '' || String(name).startsWith('NA')) {
      continue;
    }
    
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();
    const cleanEmpCode = String(empCode || '').trim();
    
    const plainPassword = generatePassword(cleanName, cleanEmpCode);
    const role = getRole(designation);
    
    try {
      // Check if already exists
      const existing = await pool.query(
        'SELECT id FROM users WHERE LOWER(email) = $1',
        [cleanEmail]
      );
      
      if (existing.rows.length > 0) {
        console.log(`⏭️  SKIP (exists): ${cleanEmail}`);
        skipped++;
        continue;
      }
      
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      await pool.query(
        `INSERT INTO users (name, email, password, role, department, mobile, pan_card, is_active, has_set_password)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, true)`,
        [cleanName, cleanEmail, hashedPassword, role, department, mobile, pan]
      );
      
      inserted++;
      summary.push({ name: cleanName, email: cleanEmail, password: plainPassword, designation });
      console.log(`✅ Inserted: ${cleanName} (${cleanEmail}) | pwd: ${plainPassword}`);
      
    } catch (err) {
      errors++;
      console.error(`❌ Error for ${cleanEmail}: ${err.message}`);
    }
  }
  
  console.log('\n========================================');
  console.log(`✅ Inserted : ${inserted}`);
  console.log(`⏭️  Skipped  : ${skipped}`);
  console.log(`❌ Errors   : ${errors}`);
  console.log('========================================\n');
  
  if (summary.length > 0) {
    console.log('📋 LOGIN CREDENTIALS SUMMARY:');
    console.log('='.repeat(100));
    console.log('Name'.padEnd(40) + 'Email'.padEnd(45) + 'Password'.padEnd(20) + 'Designation');
    console.log('-'.repeat(100));
    for (const s of summary) {
      console.log(
        s.name.padEnd(40) +
        s.email.padEnd(45) +
        s.password.padEnd(20) +
        (s.designation || '')
      );
    }
    console.log('='.repeat(100));
  }
  
  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
