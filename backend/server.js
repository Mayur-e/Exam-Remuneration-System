const app = require("./src/app");
const { startGoogleSheetSyncJob } = require("./src/jobs/googleSheetSync.job");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);

  // Start Google Sheet polling job (runs every 1 minute)
  // Will silently skip if GOOGLE_SHEET_ID is not configured in .env
  startGoogleSheetSyncJob();
});
