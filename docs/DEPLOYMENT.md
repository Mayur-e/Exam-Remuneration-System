# 🚀 PCCOE Exam Remuneration System - LAN Deployment Guide

This guide outlines the steps required to deploy the system on your college LAN so that any computer connected to the college network can access it.

## 1. Prerequisites
- **Server**: A Linux/Windows server connected to the college LAN with a static IP address (e.g., `192.168.1.100`).
- **Software**: Node.js (v18+) and PostgreSQL (v14+) installed.
- **Service Account**: A Google Service Account `credentials.json` file for Google Sheets polling (see `Google_Form_Setup_Guide.md`).

---

## 2. Identify the Server's IP Address
Before you start, find the IPv4 address of the computer hosting the application:
- **Windows**: Open Command Prompt and type `ipconfig`. Look for `IPv4 Address` (e.g., `192.168.1.100`).
- **Linux**: Type `ip a` or `ifconfig`.

> [!IMPORTANT]
> Ensure this IP address is **STATIC** (doesn't change when the server restarts), otherwise users will lose access to the site when the router assigns a new IP.

---

## 3. Deployment on Ubuntu (Automated)

We have created a fully automated setup script for Ubuntu servers. 
This script will automatically install Node.js, PostgreSQL, Nginx, configure the database with your seed data, and build the frontend.

### Step-by-Step Installation:

1. **Transfer the Project**:
   Zip your entire `exam-remuneration-system` folder and transfer it to the Ubuntu server (e.g., via WinSCP, SFTP, or a USB drive).
   
2. **Extract the Project**:
   Unzip the folder on the server.
   ```bash
   unzip exam-remuneration-system.zip
   cd exam-remuneration-system
   ```

3. **Fix Windows Line Endings & Permissions (Important)**:
   Because the file was created on Windows, you must fix the line endings before running it on Ubuntu:
   ```bash
   sed -i 's/\r$//' setup_ubuntu.sh
   chmod +x setup_ubuntu.sh
   ```

4. **Run the Automated Setup**:
   The script requires root privileges to install packages and configure Nginx.
   ```bash
   sudo bash setup_ubuntu.sh
   ```

5. **Wait for Completion**:
   The script will:
   - Detect the server's IP automatically.
   - Install PostgreSQL and set the password to `ERMSPCCOE`.
   - Restore the database schema and master data (users, subjects, rates).
   - Update your `.env` files to point to the server's IP address.
   - Install PM2 and start the backend.
   - Build the React frontend.
   - Configure Nginx to serve the site on Port 80.
   - Open ports 80, 5000, and 22 on the UFW firewall.

### Post-Installation Checklist
- [ ] Add your `credentials.json` to the `backend/` folder.
- [ ] Edit `backend/.env` and update the `GOOGLE_SHEET_ID`.
- [ ] Restart the backend to apply the sheet config: `pm2 restart erms-api`
- [ ] **Google Cloud Console**: Whitelist the Server's IP address (e.g., `http://192.168.1.100`) under "Authorized JavaScript origins" for your OAuth Client ID so that Google Login works.

---

## 4. Manual Configuration (If script fails)
DB_USER=postgres
DB_PASS=your_secure_password
DB_HOST=localhost
DB_NAME=ERMS
JWT_SECRET=generate_a_long_random_string_here
JWT_EXPIRES_IN=24h

# The IP of this server + frontend port (e.g., 5173 for Vite or 80 for Nginx)
FRONTEND_URL=http://192.168.1.100:5173

# Google Sheets Polling
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_KEY=./credentials.json
SHEET_RANGE=Form Responses 1!A:K
```

### Start the Backend
Instead of using `npm run dev`, you should use PM2 to keep the backend running permanently even if it crashes or the server restarts.

```bash
cd backend
npm install
npm install -g pm2
pm2 start server.js --name "erms-api"
pm2 save
pm2 startup
```

*(If you just want to run it normally: `npm start`)*

---

## 4. Frontend Setup

For the frontend to work on the LAN, it must know where the backend API is. Since it's no longer running on `localhost`, you must explicitly tell it the server's IP address.

### Configure `.env`
Create or edit the `.env` file in the `frontend/` directory:

```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# MUST be the IP address of the server, NOT localhost
VITE_API_URL=http://192.168.1.100:5000/api
```

### Build and Serve the Frontend
You have two options for serving the frontend on the LAN:

**Option A: Simple (Using Vite)**  
You can use Vite to serve the files directly, but you must pass the `--host` flag so it binds to the LAN IP instead of just `localhost`.
```bash
cd frontend
npm install
# The --host flag is required for LAN access!
npm run dev -- --host
```

**Option B: Production (Using `serve` or Nginx)**  
For a real deployment, build the optimized static files and serve them:
```bash
cd frontend
npm run build
npm install -g serve
# Serve the dist folder on port 80 (default HTTP port)
serve -s dist -l 80
```
> [!NOTE]
> If you use Option B on port 80, users can access the system by simply typing `http://192.168.1.100` into their browser (no port needed).

---

## 5. Security & Firewall
If other computers on the LAN cannot access the page, the server's firewall is likely blocking the connections.

**Windows Firewall:**
1. Open Windows Defender Firewall -> Advanced Settings.
2. Inbound Rules -> New Rule -> Port.
3. Allow TCP ports `5000` (Backend) and `5173` or `80` (Frontend).

**Linux (UFW):**
```bash
sudo ufw allow 5000/tcp
sudo ufw allow 80/tcp
```

---

## 6. Accessing the System
Once everything is running, any computer connected to the college LAN can open a web browser and go to:
- `http://192.168.1.100:5173` (if using Option A)
- `http://192.168.1.100` (if using Option B)
