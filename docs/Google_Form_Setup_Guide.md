# Google Form → Database Integration Guide

## How It Works

```
Examiner fills Google Form
        ↓
Google Apps Script fires automatically on submit
        ↓
Apps Script sends POST to your publicly accessible backend
        ↓
Backend validates token + saves data to PostgreSQL
        ↓
Exam status → UNDER_COORDINATOR_REVIEW ✅
```

---

## Step 1: Ensure Backend is Publicly Accessible

Your backend API must be accessible from the internet so Google Apps Script can reach it.
If deploying to production, this will be your production domain (e.g., `https://api.pccoe.ac.in`).

**Note your public URL** — you'll need it in Step 4.

---

## Step 2: Create the Google Form

Go to https://forms.google.com and create a new form titled:
**"External Examiner Details — PCCOE Exam Remuneration"**

Add these questions (all **Short answer**, all **Required**):

| # | Question Label | Notes |
|---|---------------|-------|
| 1 | Exam Reference Token | Faculty will provide this |
| 2 | Full Name | |
| 3 | Email Address | |
| 4 | Mobile Number | |
| 5 | Parent Institute Name | |
| 6 | PAN Card Number | |
| 7 | Bank Name | |
| 8 | Branch Name | Optional — can leave not required |
| 9 | Account Number | |
| 10 | IFSC Code | |

---

## Step 3: Link Google Sheet to the Form

1. In the Form, click **Responses** tab
2. Click the **Google Sheets icon** (Create Spreadsheet)
3. Name it: `ERMS External Examiner Responses`
4. Click **Create**

---

## Step 4: Add the Apps Script

1. In the linked Google Sheet, click **Extensions → Apps Script**
2. Delete any existing code
3. Paste this script:

```javascript
// ============================================================
// PCCOE ERMS — Google Form to Database Webhook
// Paste this in Extensions → Apps Script of the response sheet
// ============================================================

const BACKEND_URL = "https://YOUR-PUBLIC-API-DOMAIN/api/external/google-form-webhook";
const WEBHOOK_SECRET = "pccoe_erms_webhook_2024";

function onFormSubmit(e) {
  try {
    const response = e.namedValues;

    // Map form fields to API fields
    // Key names must EXACTLY match your Google Form question labels
    const payload = {
      secret: WEBHOOK_SECRET,
      token:            (response["Exam Reference Token"] || [""])[0].trim(),
      full_name:        (response["Full Name"] || [""])[0].trim(),
      email:            (response["Email Address"] || [""])[0].trim(),
      mobile:           (response["Mobile Number"] || [""])[0].trim(),
      parent_institute: (response["Parent Institute Name"] || [""])[0].trim(),
      pan_number:       (response["PAN Card Number"] || [""])[0].trim(),
      bank_name:        (response["Bank Name"] || [""])[0].trim(),
      branch_name:      (response["Branch Name"] || [""])[0].trim(),
      account_number:   (response["Account Number"] || [""])[0].trim(),
      ifsc_code:        (response["IFSC Code"] || [""])[0].trim(),
    };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const result = UrlFetchApp.fetch(BACKEND_URL, options);
    const responseCode = result.getResponseCode();
    const responseText = result.getContentText();

    // Log result in sheet column (optional — for debugging)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();
    const statusCol = sheet.getLastColumn() + 1;

    if (responseCode === 200) {
      sheet.getRange(lastRow, statusCol).setValue("✅ Saved to DB");
      Logger.log("SUCCESS: " + responseText);
    } else {
      sheet.getRange(lastRow, statusCol).setValue("❌ Error: " + responseCode + " — " + responseText);
      Logger.log("ERROR " + responseCode + ": " + responseText);
    }

  } catch (err) {
    Logger.log("Exception: " + err.toString());
  }
}
```

4. Replace `YOUR-PUBLIC-API-DOMAIN` with the actual public URL from Step 1
5. Click **Save** (disk icon)

---

## Step 5: Set Up the Trigger

1. In Apps Script, click **Triggers** (clock icon on left sidebar)
2. Click **+ Add Trigger**
3. Set:
   - Function: `onFormSubmit`
   - Event source: `From spreadsheet`
   - Event type: `On form submit`
4. Click **Save** → authorize when asked

---

## Step 6: Test It

1. Faculty generates a token from the system (click "Generate Link" — copy the token from the URL)
2. Share the Google Form link with the examiner
3. Tell the examiner: **"Put this token in the 'Exam Reference Token' field: `abc123...`"**
4. Examiner fills and submits the form
5. Check the Google Sheet — you should see **✅ Saved to DB** in the last column
6. Check the system — exam status should now be **UNDER_COORDINATOR_REVIEW**

---

## Workflow Summary

```
Faculty creates External Teaching claim
        ↓
Faculty clicks "Generate Link" → copies the TOKEN from the URL
  (URL looks like: http://localhost:5173/external/claim/TOKEN_HERE)
        ↓
Faculty sends Google Form link to examiner via WhatsApp/Email
Faculty also tells examiner: "Enter this token: TOKEN_HERE"
        ↓
Examiner fills Google Form (accessible from anywhere)
        ↓
Data automatically saved to database ✅
        ↓
Coordinator gets notified to review
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| ❌ Error 401 | WEBHOOK_SECRET in script doesn't match .env |
| ❌ Error 400 "Invalid token" | Token is expired or already used |
| ❌ Error 400 "Missing fields" | Form question labels don't match exactly |
| ❌ Connection refused | Backend is not publicly accessible |
| Script not firing | Check trigger is set to "On form submit" |
