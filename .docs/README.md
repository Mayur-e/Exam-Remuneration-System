# 🎓 ERMS - Exam Remuneration Management System

A comprehensive, automated full-stack solution for managing examination remuneration claims, approvals, and disbursements. Built for educational institutions to streamline the financial workflow between Faculty, Admin (Exam Cell), and Accounts Department.

---

## 🚀 Key Features

### 👨‍🏫 Faculty Portal
- **Dashboard**: Real-time overview of current and past claims (`DRAFT`, `SUBMITTED`, `APPROVED`, `PAID`).
- **Claim Generation**: 
  - **Teaching Claims**: Internal (PR/OR/TW) and External examiner claims.
  - **Non-Teaching Claims**: For support staff (Lab Assistant, Peon, etc.).
- **Automated Calculation**: Remuneration calculated instantly based on student count, batch sizes, and university rates.
- **Staff Management**: Add and manage support staff for each exam duty.
- **Bank Details**: Secure management of bank account information for reimbursement.
- **Security**: Secure password management and profile updates.

### 🛡️ Admin Portal (Exam Cell)
- **Central Dashboard**: Metrics on total claims, pending approvals, and processed amounts.
- **Claim Verification**: Review, verify, reject, or send back claims with remarks.
- **Audit Logs**: Comprehensive trail of all system actions for accountability.
- **Faculty Management**: View faculty profiles and exam history.
- **External Supervision**: Manage external examiner details and appointments.
- **System Configuration**: (UI) Manage remuneration rates and staff norms.

### 💰 Accountant Portal (Finance)
- **Financial Dashboard**: Overview of pending payouts and disbursed amounts.
- **Payment Processing**: Process payments for approved claims via NEFT/RTGS/Cheque/Cash.
- **Bill Management**: View detailed bills and generating payment records.
- **Payment History**: Track all historical transactions.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS 3.4
- **Components**: Radix UI Primitives, Lucide React Icons
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **State Management**: React Hooks (Context API where needed)
- **Validation**: Custom validation utilities

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: PostgreSQL 16+
- **ORM/Driver**: `node-pg` (Native PostgreSQL driver)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: 
  - `helmet` (Security Headers)
  - `express-rate-limit` (DDoS protection)
  - `express-validator` (Input sanitization)
  - `bcrypt` (Password hashing)
- **File Handling**: Multer (Document uploads)

### Database
- **PostgreSQL**: Relational schema handling complex financial relationships.
- **Stored Procedures**: `calculate_exam(exam_id)` for atomic, server-side remuneration logic.
- **Triggers**: Automated timestamps and audit logging.

---

## 🔐 Security Measures

This project implements enterprise-grade security practices:
1. **Input Validation**: 
   - **Frontend**: Real-time validation for emails, passwords, PAN numbers, IFSC codes, and numeric inputs.
   - **Backend**: Strict middleware validation using `express-validator` to sanitize and verify all incoming requests.
2. **Authentication**: Stateless JWT authentication with role-based access control (RBAC).
3. **Password Security**: Passwords are hashed using `bcrypt` before storage.
4. **Rate Limiting**: API routes are protected against brute-force attacks (100 req/15min).
5. **Security Headers**: `Helmet.js` sets secure HTTP headers (XSS Filter, HSTS, No-Sniff, etc.).
6. **SQL Injection Protection**: Uses parameterized queries via `node-pg`.
7. **XSS Protection**: Inputs are sanitized to prevent script injection.

---

## 📂 Project Structure

```bash
exam-remuneration-system/
├── backend/                  # Node.js API Server
│   ├── src/
│   │   ├── config/           # DB and App Configuration
│   │   ├── controllers/      # Route Logic (Auth, Faculty, Admin, Accountant)
│   │   ├── middleware/       # Auth, Validation, Rate Limiters
│   │   ├── routes/           # API Endpoints
│   │   ├── services/         # Business Logic
│   │   ├── utils/            # Helper functions
│   │   └── app.js           # Express App Setup
│   └── package.json
│
├── frontend/                 # React Vite Client
│   ├── src/
│   │   ├── components/       # Reusable UI (Layouts, Settings, Inputs)
│   │   ├── pages/            # View Controllers (Faculty, Admin, etc.)
│   │   ├── services/         # API Service (Axios)
│   │   ├── utils/            # Validation & Formatting Helpers
│   │   └── routes/           # App Routing
│   └── package.json
│
└── schema.sql                # Database Schema Dump
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd exam-remuneration-system
```

### 2. Database Setup
1. Create a PostgreSQL database named `ERMS` (or your preference).
2. Restore the schema:
   ```bash
   psql -U postgres -d ERMS -f schema.sql
   ```
3. (Optional) Run seed scripts if available in `backend/scripts`.

### 3. Backend Setup
```bash
cd backend
npm install

# Create .env file with the following content:
# PORT=5000
# DB_USER=postgres
# DB_PASSWORD=yourpassword
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=ERMS
# JWT_SECRET=your_jwt_strong_secret
# FRONTEND_URL=http://localhost:5173

npm run dev
```
_Server runs on port 5000 by default._

### 4. Frontend Setup
```bash
cd frontend
npm install

# Create .env file if needed (Vite uses check for VITE_API_URL, default is usually localhost:5000)

npm run dev
```
_Client runs on port 5173 by default._

---

## 📡 API Endpoints Summary

### Auth
- `POST /api/auth/login` - User Login
- `POST /api/auth/register` - Faculty Registration
- `POST /api/auth/change-password` - Update Password

### Faculty
- `POST /api/faculty/exams` - Create Exam Claim
- `GET /api/faculty/exams` - List Draft/Submitted Exams
- `POST /api/faculty/exams/:id/staff` - Add Support Staff
- `PUT /api/faculty/profile` - Update Profile/Bank Details

### Admin
- `GET /api/admin/claims/pending` - View Pending Claims
- `POST /api/admin/claims/:id/approve` - Approve Claim
- `POST /api/admin/claims/:id/reject` - Reject Claim
- `GET /api/admin/audit-logs` - System Audit Trail

### Accountant
- `GET /api/accountant/claims/approved` - View Payable Claims
- `POST /api/accountant/payments` - Record Payment

---

## 🧪 Development Commands

**Backend:**
- `npm start` - Run production server
- `npm run dev` - Run development server with Nodemon

**Frontend:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---


---
*© 2026 Exam Remuneration Management System. All Rights Reserved.*
