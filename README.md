# SevaSetu — Cooperative-Owned Home Services Marketplace Platform

**SevaSetu** ("Bridge of Service") is a full-stack MERN platform connecting Labour Cooperative Federation/Society workers (cooks, cleaners, electricians, plumbers, painters, caregivers, drivers, etc.) directly with customers needing household/community services.

Built with a **fair-wage protection model**, worker democratic ownership, admin fair-wage floors, real-time booking status updates via Socket.io, Razorpay payment simulation, and demand forecasting analytics.

---

## 🌟 Key Features

### 👤 Customer Features
- **Browse & Filter Services**: Explore 10 core service categories (Cook, House Cleaning, Electrician, Plumber, Carpenter, Painter, Driver, Gardener, Caregiver, Technician). Filter by city/pincode, sort by rating and price.
- **Emergency / On-Demand Booking**: Auto-assigns the first available verified worker matching category and location.
- **Real-Time Booking Status**: Socket.io live tracking stepper (`Requested` → `Accepted` → `In Progress` → `Completed`).
- **Razorpay Test Mode Payments**: Built-in test payment SDK integration with instant receipt generation.
- **Printable / Downloadable Invoices**: Styled PDF/printable HTML invoice dialog detailing customer info, worker payout (95%), and cooperative fee split (5%).
- **Worker Reviews**: 1-5 star ratings and feedback submission after payment.

### 🛠 Worker Features
- **Unified Registration**: Multi-category selection, custom rate input with suggested minimum fair-wage floor indicator, photo & ID proof document upload preview.
- **Pending Approval Screen**: Blocks dashboard access until society admin verifies profile and ID proof documents.
- **Work Availability Switch**: Toggle between `Available` and `Busy` (auto-toggles to busy on booking acceptance and back to available on job completion).
- **Incoming Job Requests**: Real-time accept / reject request cards.
- **Job Status Stepper**: Transition accepted jobs from `Accepted` → `In Progress` → `Completed`.
- **Earnings Tracker**: Completed job payout ledger and monthly earnings stats.

### 🏢 Society Admin Features
- **Society Dashboard**: Manage workers registered under your specific Labour Cooperative Society.
- **Registration Verification**: Review worker ID proof documents and approve or reject with a custom reason.
- **Fair-Wage Floor Manager**: Set and edit the minimum hourly wage floor per category.
- **Society Booking Monitor**: Track all booking lifecycles for your society's workers.

### 👑 Federation Admin Features
- **Top-Level Governance**: Cross-society aggregated metrics (total workers, total customers, total bookings, total revenue).
- **Category Worker Breakdown Cards**: Clickable category cards (e.g. "Cook: 12 workers", "House Cleaning: 25 workers") filtering workers by category.
- **30-Day Demand Forecast Chart**: Interactive Recharts visualization showing 20-day historical booking volume vs 10-day AI predicted demand peaks by category.
- **Society Management**: Register new Labour Cooperative Societies.

### 🌐 General & UI Features
- **English / Hindi Language Switcher**: Static UI translation toggle in top Navbar (`EN` / `HI`).
- **Trustworthy Theme**: Modern UI styled with trustworthy Teal (`#0d9488`) and warm Amber (`#f59e0b`) tones.
- **Database Connection Flexibility**: Supports MongoDB URIs and automatically falls back to `mongodb-memory-server` if no local Mongo instance is running.

---

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts, Socket.io-client, Axios.
- **Backend**: Node.js, Express.js, MongoDB with Mongoose, JWT, bcryptjs, Socket.io, Razorpay SDK, mongodb-memory-server.

---

## 📁 Project Directory Structure

```
sevasetu/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & memory fallback
│   ├── controllers/              # Auth, Worker, Booking, Payment, Admin, Society, Category
│   ├── middleware/               # JWT auth & RBAC middleware, error handling
│   ├── models/                   # User, Worker, Society, Category, Booking, Review, Payment
│   ├── routes/                   # RESTful API endpoints
│   ├── sockets/                  # Socket.io real-time booking updates
│   ├── seed.js                   # Seed script populating sample societies, workers, bookings
│   ├── server.js                 # Express + Socket.io server
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Footer, WorkerCard, CategoryCard, InvoiceModal, EmergencyBookingModal, ReviewModal, DemandForecastChart
│   │   ├── context/              # AuthContext, SocketContext, LanguageContext
│   │   ├── pages/                # Home, Login, Register, WorkerPendingApproval, CustomerDashboard, WorkerDashboard, SocietyAdminDashboard, FederationAdminDashboard
│   │   ├── utils/                # api.js, translations.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## ⚙️ Setup & Installation Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Pre-populates database with sample categories, societies, workers, and historical 30-day bookings
npm start        # Starts Express server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
```

Open `http://localhost:3000` in your web browser.

---

## 🔐 Environment Variables (.env)

### Backend (`/backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/sevasetu
JWT_SECRET=sevasetu_jwt_super_secret_key_2026
JWT_EXPIRE=30d
RAZORPAY_KEY_ID=rzp_test_sevasetu_key_12345
RAZORPAY_KEY_SECRET=rzp_test_sevasetu_secret_67890
CLOUDINARY_CLOUD_NAME=sevasetu_cloud
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz1
```

---

## 🔑 Single-Click Demo Credentials

On the **Login** page, you can click any of the role preset buttons or use these credentials:

| Role | Email | Password | Description |
|---|---|---|---|
| **Customer** | `customer@sevasetu.org` | `password123` | Book services, emergency auto-assign, pay via Razorpay, view invoices & reviews |
| **Worker (Approved)** | `worker.ramesh@sevasetu.org` | `password123` | Approved Cook worker dashboard, toggle Available/Busy, accept jobs |
| **Worker (Pending)** | `worker.pending@sevasetu.org` | `password123` | Unapproved worker landing on "Pending Approval" screen |
| **Society Admin** | `societyadmin@sevasetu.org` | `password123` | Approve/reject Mumbai society workers, ID document review, edit fair wage floor |
| **Federation Admin** | `fedadmin@sevasetu.org` | `password123` | Top-level dashboard, category worker cards, 30-day Demand Forecast chart |
