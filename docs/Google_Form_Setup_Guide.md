# Google Form → Database Integration Guide (Polling Method)

## How It Works

```
Examiner fills Google Form
        ↓
Google saves response to linked Google Sheet
        ↓
Backend polls the sheet every 1 minute (node-cron)
        ↓
Backend validates token + saves data to PostgreSQL
        ↓
Exam status → UNDER_COORDINATOR_REVIEW ✅
```

> **Why polling instead of webhook?**  
> Polling does not require a public URL. Works from localhost, college LAN,
> or production — no Cloudflare tunnel needed.

---

## Step 1: Create the Google Form

Go to https://forms.google.com → create a new form titled:  
**"External Examiner Details — PCCOE Exam Remuneration"**

Add these questions (all **Short answer**):

| # | Question Label | Required? |
|---|---------------|-----------|
| 1 | Exam Reference Token | ✅ Yes |
| 2 | Full Name | ✅ Yes |
| 3 | Email Address | ✅ Yes |
| 4 | Mobile Number | ✅ Yes |
| 5 | Parent Institute Name | ✅ Yes |
| 6 | PAN Card Number | ✅ Yes |
| 7 | Bank Name | ✅ Yes |
| 8 | Branch Name | ❌ Optional |
| 9 | Account Number | ✅ Yes |
| 10 | IFSC Code | ✅ Yes |

---

## Step 2: Link Google Sheet to the Form

1. In the Form, click the **Responses** tab
2. Click the **Google Sheets icon** (Create Spreadsheet)
3. Name it: `ERMS External Examiner Responses`
4. Click **Create**

The sheet will automatically have these columns (in order):  
`Timestamp | Exam Reference Token | Full Name | Email Address | Mobile Number | Parent Institute Name | PAN Card Number | Bank Name | Branch Name | Account Number | IFSC Code`

---

## Step 3: Create a Google Cloud Service Account

1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing) → name it `ERMS`
3. Go to **APIs & Services → Library** → search **Google Sheets API** → Enable it
4. Go to **APIs & Services → Credentials** → **Create Credentials → Service Account**
   - Name: `erms-sheet-reader`
   - Role: **Viewer** (read-only)
5. Click the created service account → **Keys tab → Add Key → JSON**
6. Download the JSON file → rename it to `credentials.json`
7. **Place `credentials.json` in the `backend/` folder**

---

## Step 4: Share the Google Sheet with the Service Account

1. Open `credentials.json` — find the `"client_email"` field (looks like `erms-sheet-reader@your-project.iam.gserviceaccount.com`)
2. Open your Google Sheet → click **Share**
3. Paste the `client_email` address → grant **Viewer** access
4. Click **Send**

> Without this step, the backend will get a 403 Forbidden error.

---

## Step 5: Configure `.env`

Open `backend/.env` and fill in:

```bash
# Get from the sheet URL: https://docs.google.com/spreadsheets/d/<THIS_PART>/edit
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms

# Path to the service account key file
GOOGLE_SERVICE_ACCOUNT_KEY=./credentials.json

# Sheet tab name — must match exactly (check the tab at the bottom of the sheet)
SHEET_RANGE=Form Responses 1!A:K
```

---

## Step 6: Start the Backend

```bash
cd backend
npm run dev
```

On startup you should see:
```
Server running on port 5000
[SheetSync] Scheduling Google Sheet sync every 1 minute...
[SheetSync] Starting sync at 2026-04-25T04:38:00.000Z
[SheetSync] No data rows found — nothing to process.
```

---

## Step 7: Test It

1. Faculty generates a token from the dashboard → **Generate Link**
2. Copy the token from the URL (the part after `/external/claim/`)
3. Open the Google Form → fill it out, entering the token in **"Exam Reference Token"**
4. Submit the form
5. Wait up to **1 minute**
6. Check the backend console — you should see:
   ```
   [SheetSync] ✅ Row 2: Exam 32 → UNDER_COORDINATOR_REVIEW (submitted at 4/25/2026 10:05:00)
   ```
7. Refresh the dashboard — exam status should now be **Under Coordinator Review**

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `Service-account key not found` | credentials.json missing | Place it in `backend/` folder |
| `403 Forbidden` | Sheet not shared with service account | Share the sheet with the `client_email` |
| `GOOGLE_SHEET_ID not set` | Missing env var | Add it to `backend/.env` |
| `Token not found` | Wrong token entered in form | Double-check the token |
| `Token already used` | Form submitted twice | Normal — second row is skipped |
| `[SheetSync] Previous sync still running` | Slow network | Normal — next tick will run |
| Exam stays in draft | Sheet not shared OR sheet ID wrong | Check Step 4 and Step 5 |

---

## Column Order Reference

The backend expects this exact column order (A to K):

| Column | Letter | Field |
|--------|--------|-------|
| 0 | A | Timestamp (auto) |
| 1 | B | Exam Reference Token |
| 2 | C | Full Name |
| 3 | D | Email Address |
| 4 | E | Mobile Number |
| 5 | F | Parent Institute Name |
| 6 | G | PAN Card Number |
| 7 | H | Bank Name |
| 8 | I | Branch Name |
| 9 | J | Account Number |
| 10 | K | IFSC Code |

If you add/remove questions in the form, update `COL` in `src/jobs/googleSheetSync.job.js` to match.
