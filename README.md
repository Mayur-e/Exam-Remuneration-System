# 🎓 Exam Remuneration System

A comprehensive web application designed to streamline and automate the process of managing, submitting, and processing exam remuneration claims for university faculty and staff.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-PERN-orange.svg)

## 🚀 Overview

The **Exam Remuneration System** replaces manual, paper-based claim processing with a digital workflow. It handles end-to-end claim management—from faculty submission to administrative approval and final payment processing by the accounts department.

The system supports various claim types including **Teaching (Internal/External)** and **Non-Teaching (Staff)** claims, ensuring all university norms and rate cards are strictly followed.

## ✨ Key Features

### 👥 For Faculty & Staff
- **Dashboard**: Track status of all submitted claims.
- **Smart Forms**: Auto-filled details and intelligent validation to prevent errors.
- **Teaching Claims**: Support for Theory, Practical, Oral, and Termwork exams.
- **Non-Teaching Claims**: Manage staff allocation (Laboratory Assistants, Peons, etc.) with auto-validation of staff norms.
- **Validation**:
  - **Subject Code Verification**: Ensures claims are only raised for valid university subjects.
  - **Date Logic**: Enforces preparation, exam, and cleaning date ordering.
  - **Bank Details**: Mandatory validation of bank account info before submission.

### 🔗 For External Examiners
- **Guest Access**: Secure, token-based links for external examiners to upload documents (PAN, Cheque) and submit claims without full registration.

### 🛡️ For Admin & Management
- **Verification Workflow**: Approve or reject claims with comments.
- **Remuneration Rates**: Configurable rate cards for different exam types and roles.
- **Staff Norms**: Define limits for staff allocation based on student count.

### 💰 For Accounts / Billing
- **Final Processing**: Verify calculated amounts and process payments.
- **Allowance Management**: Manage Chairman and Conveyance allowances.
- **Reports**: Generate detailed Excel/PDF reports for final billing.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, TailwindCSS (Responsive UI)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Relational Data, Complex Queries)
- **Authentication**: JWT & Cookie-based Auth
- **PDF Generation**: pdfmake / Puppeteer

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/exam-remuneration-system.git
cd exam-remuneration-system
```

### 2. Database Setup
1. Create a PostgreSQL database (e.g., `exam_remuneration_db`).
2. Run the schema migrations:
   ```bash
   psql -U postgres -d exam_remuneration_db -f schema.sql
   ```
   *Note: Ensure you also run any additional SQL scripts in `database/migrations` for latest updates.*

### 3. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=exam_remuneration_db
DB_PASSWORD=yourpassword
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```
Run the server:
```bash
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Run the frontend:
```bash
npm run dev
```

## 📝 Validations & Rules

The system implements strict validation to ensure data integrity:
- **Course Code**: Must be selected from the master database. Manual entry is flagged.
- **Dates**: `Preparation Phase` < `Examination Phase` ≤ `Cleaning Phase`.
- **Expert Assistant**: Cannot claim preparation or cleaning days.
- **Bank Details**: Submission is blocked if bank details are missing.

## 🤝 Contribution

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


