# User Authentication & KYC Management

## Overview
The Authentication and KYC (Know Your Customer) system ensures that all users are verified and that their financial details are securely stored for remuneration disbursements.

## Roles Involved
- **Faculty (Internal)**: Regular users who register and provide bank details.
- **External Examiners**: Guest users who provide one-time KYC for payments.
- **Administrator**: Oversees user registrations and security logs.

## Features & API Integration

### 1. User Registration & Login
- **Internal Faculty**: Regular registration via institutional email.
- **Google SSO**: Secure login using Google OAuth 2.0.
- **API Endpoints**:
  - `POST /api/auth/login`: Validates credentials and returns a JWT.
  - `POST /api/auth/register`: Creates a new faculty record with hashed passwords.
  - `POST /api/auth/google/check`: Verifies Google ID tokens for existing users.
  - `POST /api/auth/google/register`: Onboards new users via Google SSO metadata.

### 2. KYC & Bank Account Management
- **Profile Setup**: Internal faculty must complete their financial profile.
- **API Endpoints**:
  - `GET /api/faculty/profile`: Retrieves current user demographics and bank info.
  - `PUT /api/faculty/profile`: Updates Bank Account, IFSC, and PAN details.
- **Validation**: Backend utilizes `express-validator` to ensure IFSC and PAN follow standard Indian banking formats.

### 3. External Examiner KYC
- **One-Time Access**: External examiners use magic links; their demographics are stored temporarily.
- **API Endpoints**:
  - `GET /api/external/claims/:token`: Formats the public interface for the guest based on the link token.
  - `POST /api/external/claims/:token/submit`: Submits the final KYC and claim data.
- **File Uploads**: Uses `multer` middleware to store identity documents.
  - `POST /api/uploads`: Standardized endpoint for image/PDF ingestion.

## How to Use

### For Faculty:
1. Navigate to the **Register** page or click **Sign in with Google**.
2. Go to **Settings > Profile Details**.
3. Fill in your **Bank Account**, **IFSC**, and **PAN**.
4. Click **Save Changes**. The system will now use these details for all your future bills.

### For External Examiners:
1. Access the link received from your coordinator.
2. Fill in the "Bank Information" section.
3. Upload scans of your **PAN Card** and **Cancelled Cheque**.
4. Click **Submit**. Verify that the "Terms & Conditions" checkbox is ticked.
