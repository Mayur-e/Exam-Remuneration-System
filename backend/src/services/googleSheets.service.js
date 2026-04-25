"use strict";

/**
 * googleSheets.service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin wrapper around the Google Sheets API (googleapis v4).
 * Authentication: Service Account JSON key stored at GOOGLE_SERVICE_ACCOUNT_KEY.
 *
 * Usage:
 *   const { fetchSheetRows } = require("./googleSheets.service");
 *   const rows = await fetchSheetRows();   // returns raw 2-D array
 */

const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

// ── Config ────────────────────────────────────────────────────────────────────
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = process.env.SHEET_RANGE || "Form Responses 1!A:K";
const KEY_PATH = path.resolve(
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "./credentials.json"
);

// ── Build auth client once (singleton) ───────────────────────────────────────
let _authClient = null;

function getAuthClient() {
  if (_authClient) return _authClient;

  if (!fs.existsSync(KEY_PATH)) {
    throw new Error(
      `[GoogleSheets] Service-account key not found at "${KEY_PATH}". ` +
        "Set GOOGLE_SERVICE_ACCOUNT_KEY in .env."
    );
  }

  const key = JSON.parse(fs.readFileSync(KEY_PATH, "utf8"));

  _authClient = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return _authClient;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetches all rows from the configured Google Sheet range.
 * Returns a 2-D array of strings (raw cell values).
 * Row 0 is the header row — callers are responsible for skipping it.
 *
 * @returns {Promise<string[][]>}
 */
async function fetchSheetRows() {
  if (!SPREADSHEET_ID) {
    throw new Error(
      "[GoogleSheets] GOOGLE_SHEET_ID is not set in environment variables."
    );
  }

  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  // values can be undefined if the sheet is completely empty
  return response.data.values || [];
}

module.exports = { fetchSheetRows };
