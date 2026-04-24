# Support and Ticketing System

## Overview
Communication channel for resolving claim disputes.

## Roles Involved
- **Faculty**: Opens queries.
- **Admin/Accountant**: Responds.

## Features & API Integration

### 1. Ticket Lifecycle
- **API Endpoints**:
  - `POST /api/queries`: Creates a new record in the `queries` table.
  - `GET /api/queries`: Fetches tickets relevant to the user's role.
  - `PATCH /api/queries/:id/status`: Closes a ticket or re-opens it.

### 2. Messaging
- **API Endpoints**:
  - `POST /api/queries/:id/respond`: Appends a message to the `query_responses` table.
  - `GET /api/queries/:id/messages`: Retrieves the full conversation thread.

## How to Use

1. **New Ticket**: Go to **Help & Support**. Click **New Query**.
2. **Context**: Link your query to a specific **Claim ID**. This helps the Admin quickly find your bill.
3. **Response**: When an Admin replies, you will see a "New Message" badge.
4. **Resolution**: Once satisfied, click **Mark as Resolved**.
5. **Admin Desk**: Admins can use the **Filter by Category** tool to prioritize "Payment Delay" issues.
