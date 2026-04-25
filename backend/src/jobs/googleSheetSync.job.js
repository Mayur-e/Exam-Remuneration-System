"use strict";

/**
 * googleSheetSync.job.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cron job: polls Google Sheet every 1 minute.
 *
 * For each unprocessed row it:
 *   1. Validates the exam token (not used, not expired).
 *   2. Checks for duplicate submission (same token already processed).
 *   3. Inserts examiner data into `external_examiners`.
 *   4. Updates `exams.status` → 'UNDER_COORDINATOR_REVIEW'.
 *   5. Marks `external_exam_links.used = true`.
 *   6. Initialises remuneration_calculations row + triggers calculation.
 *
 * Idempotent: safe to run while another sync is still in progress because
 *   - we lock the link row with FOR UPDATE
 *   - used=false guard prevents double-processing
 *   - the cron job itself uses a mutex flag (_isSyncing) to avoid overlap
 *
 * Column mapping (0-indexed, range A:K):
 *   0  Timestamp
 *   1  Exam Reference Token
 *   2  Full Name
 *   3  Email Address
 *   4  Mobile Number
 *   5  Parent Institute Name
 *   6  PAN Card Number
 *   7  Bank Name
 *   8  Branch Name        (optional)
 *   9  Account Number
 *   10 IFSC Code
 */

const cron = require("node-cron");
const pool = require("../config/db");
const { fetchSheetRows } = require("../services/googleSheets.service");

// ── Mutex: prevents concurrent syncs if one run takes longer than 1 min ──────
let _isSyncing = false;

// ── Column indices (change here if sheet order changes) ──────────────────────
const COL = {
  TIMESTAMP: 0,
  TOKEN: 1,
  FULL_NAME: 2,
  EMAIL: 3,
  MOBILE: 4,
  PARENT_INSTITUTE: 5,
  PAN_NUMBER: 6,
  BANK_NAME: 7,
  BRANCH_NAME: 8,
  ACCOUNT_NUMBER: 9,
  IFSC_CODE: 10,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Safely trims a cell value; returns empty string for missing cells. */
const cell = (row, idx) => (row[idx] || "").trim();

/** Returns true when all mandatory fields are non-empty. */
function isValidRow(row) {
  return (
    cell(row, COL.TOKEN) &&
    cell(row, COL.FULL_NAME) &&
    cell(row, COL.EMAIL) &&
    cell(row, COL.MOBILE) &&
    cell(row, COL.PARENT_INSTITUTE) &&
    cell(row, COL.PAN_NUMBER) &&
    cell(row, COL.BANK_NAME) &&
    cell(row, COL.ACCOUNT_NUMBER) &&
    cell(row, COL.IFSC_CODE)
  );
}

// ── Core sync function ────────────────────────────────────────────────────────

async function syncGoogleSheet() {
  if (_isSyncing) {
    console.log("[SheetSync] Previous sync still running — skipping this tick.");
    return;
  }

  _isSyncing = true;
  console.log(`[SheetSync] Starting sync at ${new Date().toISOString()}`);

  let rows;
  try {
    rows = await fetchSheetRows();
  } catch (err) {
    console.error("[SheetSync] Failed to fetch rows from Google Sheets:", err.message);
    _isSyncing = false;
    return;
  }

  if (rows.length <= 1) {
    console.log("[SheetSync] No data rows found — nothing to process.");
    _isSyncing = false;
    return;
  }

  // Skip header row (row 0); iterate from row 1 onward
  const dataRows = rows.slice(1);
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2; // human-readable row number (header = row 1)

    // ── 1. Skip completely empty rows ─────────────────────────────────────────
    if (!row || row.length === 0) continue;

    // ── 2. Validate required fields ───────────────────────────────────────────
    if (!isValidRow(row)) {
      console.warn(`[SheetSync] Row ${rowNum}: Missing required fields — skipping.`);
      skipped++;
      continue;
    }

    const token          = cell(row, COL.TOKEN);
    const full_name      = cell(row, COL.FULL_NAME);
    const email          = cell(row, COL.EMAIL);
    const mobile         = cell(row, COL.MOBILE);
    const parent_inst    = cell(row, COL.PARENT_INSTITUTE);
    const pan_number     = cell(row, COL.PAN_NUMBER).toUpperCase();
    const bank_name      = cell(row, COL.BANK_NAME);
    const branch_name    = cell(row, COL.BRANCH_NAME) || null;
    const account_number = cell(row, COL.ACCOUNT_NUMBER);
    const ifsc_code      = cell(row, COL.IFSC_CODE).toUpperCase();
    const sheet_ts       = cell(row, COL.TIMESTAMP) || null;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // ── 3. Validate token (lock row to prevent race condition) ────────────
      const linkRes = await client.query(
        `SELECT exam_id
           FROM external_exam_links
          WHERE token = $1
            AND used  = false
            AND (expires_at IS NULL OR expires_at > NOW())
          FOR UPDATE`,
        [token]
      );

      if (linkRes.rows.length === 0) {
        // Could be: invalid token, already used, or expired
        const usedCheck = await client.query(
          `SELECT used, expires_at FROM external_exam_links WHERE token = $1`,
          [token]
        );

        if (usedCheck.rows.length === 0) {
          console.warn(`[SheetSync] Row ${rowNum}: Token not found → "${token}" — skipping.`);
        } else if (usedCheck.rows[0].used) {
          console.log(`[SheetSync] Row ${rowNum}: Token already used (duplicate sheet row) — skipping.`);
        } else {
          console.warn(`[SheetSync] Row ${rowNum}: Token expired — skipping.`);
        }

        await client.query("ROLLBACK");
        skipped++;
        continue;
      }

      const examId = linkRes.rows[0].exam_id;

      // ── 4. Check if exam already has an examiner (extra safety guard) ─────
      const examCheck = await client.query(
        `SELECT external_examiner_id, status FROM exams WHERE id = $1`,
        [examId]
      );

      const exam = examCheck.rows[0];

      // Only process exams still in draft / rejected state
      const processableStatuses = ["draft", "rejected", "COORDINATOR_REJECTED"];
      if (!processableStatuses.includes(exam.status)) {
        console.log(
          `[SheetSync] Row ${rowNum}: Exam ${examId} is already in status "${exam.status}" — skipping.`
        );
        await client.query("ROLLBACK");
        skipped++;
        continue;
      }

      // ── 5. Insert or update external_examiners ────────────────────────────
      let examinerId;

      if (exam.external_examiner_id) {
        // Resubmission: update existing record
        examinerId = exam.external_examiner_id;
        await client.query(
          `UPDATE external_examiners SET
             full_name       = $1,
             email           = $2,
             mobile          = $3,
             parent_institute = $4,
             pan_number      = $5,
             bank_name       = $6,
             branch_name     = $7,
             account_number  = $8,
             ifsc_code       = $9
           WHERE id = $10`,
          [full_name, email, mobile, parent_inst, pan_number,
           bank_name, branch_name, account_number, ifsc_code, examinerId]
        );
        console.log(`[SheetSync] Row ${rowNum}: Updated examiner ${examinerId} for exam ${examId}.`);
      } else {
        // Fresh insert
        const insertRes = await client.query(
          `INSERT INTO external_examiners
             (full_name, email, mobile, parent_institute, pan_number,
              bank_name, branch_name, account_number, ifsc_code,
              is_local, journey_days, travel_allowance)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,false,0,0)
           RETURNING id`,
          [full_name, email, mobile, parent_inst, pan_number,
           bank_name, branch_name, account_number, ifsc_code]
        );
        examinerId = insertRes.rows[0].id;
        console.log(`[SheetSync] Row ${rowNum}: Inserted new examiner ${examinerId} for exam ${examId}.`);
      }

      // ── 6. Attach examiner + advance exam status ──────────────────────────
      await client.query(
        `UPDATE exams
            SET external_examiner_id = $1,
                status               = 'UNDER_COORDINATOR_REVIEW',
                updated_at           = NOW()
          WHERE id = $2`,
        [examinerId, examId]
      );

      // ── 7. Mark token as used ─────────────────────────────────────────────
      await client.query(
        `UPDATE external_exam_links SET used = true WHERE token = $1`,
        [token]
      );

      // ── 8. Initialise remuneration_calculations + trigger calculation ─────
      await client.query(
        `INSERT INTO remuneration_calculations (exam_id, conveyance_amount)
         VALUES ($1, 0)
         ON CONFLICT (exam_id) DO NOTHING`,
        [examId]
      );
      await client.query(`SELECT calculate_exam($1)`, [examId]);

      await client.query("COMMIT");

      console.log(
        `[SheetSync] ✅ Row ${rowNum}: Exam ${examId} → UNDER_COORDINATOR_REVIEW` +
        (sheet_ts ? ` (submitted at ${sheet_ts})` : "")
      );
      processed++;

    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`[SheetSync] ❌ Row ${rowNum}: Error processing token "${token}":`, err.message);
      errors++;
    } finally {
      client.release();
    }
  }

  console.log(
    `[SheetSync] Done — Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}`
  );
  _isSyncing = false;
}

// ── Cron registration ─────────────────────────────────────────────────────────

/**
 * Starts the polling cron job.
 * Called once from server.js at startup.
 */
function startGoogleSheetSyncJob() {
  // Guard: do not start if Google Sheet is not configured
  if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    console.warn(
      "[SheetSync] GOOGLE_SHEET_ID or GOOGLE_SERVICE_ACCOUNT_KEY not set — " +
      "Google Sheet sync job will NOT start."
    );
    return;
  }

  console.log("[SheetSync] Scheduling Google Sheet sync every 1 minute...");

  // Run immediately on startup, then every minute
  syncGoogleSheet();

  cron.schedule("* * * * *", () => {
    syncGoogleSheet().catch((err) =>
      console.error("[SheetSync] Unhandled cron error:", err)
    );
  });
}

module.exports = { startGoogleSheetSyncJob, syncGoogleSheet };
