# 🚀 PCCOE Exam Remuneration System - Deployment Guide

This guide outlines the steps required to transition the system from local development to a production environment.

## 1. Prerequisites
- **Server**: A Linux/Windows server with Node.js (v18+) and npm installed.
- **Database**: PostgreSQL (v14+) instance.
- **Domain**: A registered domain (e.g., `pccoe.ac.in`).
- **Form**: A Google Form for external examiners.

---

## 2. Backend Setup (.env)

Create a `.env` file in the `backend/` directory with the following production values:

```bash
PORT=5000
DB_USER=your_db_user
DB_PASS=your_secure_password
DB_HOST=localhost
DB_NAME=ERMS
JWT_SECRET=generate_a_long_random_string
JWT_EXPIRES_IN=24h

# URLs
FRONTEND_URL=https://your-production-app.com
TUNNEL_URL=https://your-api-endpoint.com

# Webhook Security
WEBHOOK_SECRET=choose_a_secure_secret_for_google_apps_script

# Google Form
GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/.../viewform
GOOGLE_FORM_TOKEN_FIELD_ID=entry.XXXXXX

```

---

## 3. Google Form & Webhook Integration

To bridge Google Forms with your database:

1.  **Create the Form**: Ensure you have a short-answer field for the "Exam Reference Token".
2.  **Get the Field ID**: Right-click the field in the "Preview" mode -> Inspect -> look for the `name="entry.12345"` attribute. Update `GOOGLE_FORM_TOKEN_FIELD_ID` in `.env`.
3.  **Apps Script**:
    -   In Google Forms, click 3-dots -> **Script Editor**.
    -   Paste the script provided in `documents/Google_Form_Setup_Guide.md`.
    -   Update the `API_URL` to your production API and set the `SECRET`.
    -   Add a **Trigger**: `onFormSubmit` event type.

---


## 4. Deployment Commands

### A. Frontend
The frontend must be built into static files:
```bash
cd frontend
npm install
npm run build
```
Upload the contents of the `dist/` folder to your web server (Nginx, Apache, or Firebase/Vercel).

### B. Backend
```bash
cd backend
npm install
# Run using a process manager like PM2 to ensure it restarts on crash
npm install -g pm2
pm2 start server.js --name "erms-api"
```

---

## 5. Security Checklist
- [ ] Change `JWT_SECRET` to a unique production key.
- [ ] Ensure PostgreSQL is not accessible from the public internet (use a firewall).
- [ ] Enable HTTPS (SSL) for both frontend and backend (use Let's Encrypt/Certbot).
- [ ] Update the `CORS` policy in `backend/src/app.js` to only allow your production domain.

---

## 6. Database Migration
Ensure the table schemas are created in your production PostgreSQL instance. You can use the `database.sql` script or your initialization scripts to setup the tables.

---
**Support**: Contact the Examination Department IT team for domain and DNS access.
