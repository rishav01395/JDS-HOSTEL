# JDS Hostel Management System

Step 1 establishes the full-stack project foundation. Application features will be added in later steps.

## Project Structure

```text
frontend/   Vite + React client
backend/    Node.js + Express API
```

## Prerequisites

- Node.js 20 or newer
- npm

## Install Dependencies

```powershell
cd frontend
npm install

cd ..\backend
npm install
```

## Start the Frontend

```powershell
cd frontend
npm run dev
```

The Vite development server runs at `http://localhost:5173`.

## Start the Backend

```powershell
cd backend
npm run dev
```

The Express API runs at `http://localhost:5000`. Its initial health check is available at `http://localhost:5000/api/health`.

For a production-style start, use `npm start` from the `backend` directory.
## Live admin features added
- Dashboard values are database-driven with zero/no-data fallbacks.
- Students, rooms/beds, fees and payments are CRUD/management workflows.
- Complaints can be created and status-updated.
- Mess menus can be added/edited by date from the UI; no coding is required to change meals.
- Announcements can be published, edited, archived and deleted.
- Reports are live and exportable as CSV.
- Settings control hostel details, UPI payment QR and SMS automation.
- Payment recording can automatically send an SMS to the student's stored phone number when Twilio is configured.

### SMS setup
1. Open Admin → Settings.
2. Enter Twilio Account SID, Auth Token and From number.
3. Enable "SMS after payment" and save.
4. Record a payment. The system sends the receipt/balance SMS to the student's phone.

The QR is a UPI payment deep link. A plain UPI QR cannot confirm a payment back to the hostel system by itself; to auto-mark QR payments as paid, connect a UPI/payment gateway webhook (Razorpay/Cashfree/etc.).
