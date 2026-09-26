# ⚡ ExpenseFlow — Next-Gen Payments & Expense Sharing Platform

[![Go Version](https://img.shields.io/badge/Go-1.27+-00ADD8?style=for-the-badge&logo=go)](https://golang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Compatible-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-FF6C37?style=for-the-badge)](https://websocket.org)

**ExpenseFlow** is a modern full-stack fintech platform engineered for seamless group expense sharing, dynamic split calculations, instant debt settlements, and financial analytics. Designed from scratch with an original futuristic aesthetic featuring deep navy/charcoal glassmorphism, cyan and violet energy accents, interactive 3D elements (React Three Fiber), and real-time WebSocket synchronization.

---

## 🚀 Key Features

- **Fintech UI/UX**: Original visual language avoiding generic dashboard tropes. Features glassmorphism, responsive cards, micro-animations, and full Dark/Light theme switching.
- **3D Financial Experiences**: Subtle React Three Fiber (R3F) & Three.js floating financial card and gyroscopic financial orb.
- **Dynamic Split Calculations**:
  - **Equal Split**: Auto-divided per head with penny-rounding protection and "You paid / Others owe" summaries.
  - **Custom Split**: Manual rupee inputs with total-sum validation.
  - **Percentage Split**: Percentage allocations with 100% total verification and live rupee calculations.
- **Group Expense Management**: Create and manage groups (e.g., *College Friends*, *Trip 2026*, *Roommates*) with dedicated ledgers and avatars.
- **Visual Debt Settlement Network**: Animated peer-to-peer balance graph showcasing optimal debt routing between members.
- **Instant Debt Settlements**: One-click debt settlements with UPI / Cash options, celebratory confetti, and audit history logs.
- **Financial Analytics**: Interactive Recharts dashboards featuring monthly expenditure area charts, category donuts, group volume bars, and member contribution comparisons.
- **Secure Authentication**: JWT-based bearer authentication with bcrypt password hashing and MongoDB Atlas compatibility.
- **Real-Time WebSocket Hub**: Live broadcasts for `EXPENSE_CREATED`, `EXPENSE_UPDATED`, `SETTLEMENT_COMPLETED`, and `BALANCE_UPDATED`.
- **Zero-Failure Local Development**: Built-in fallback in both frontend and backend to operate seamlessly with seed data even when offline or before configuring a remote database.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS + PostCSS + Custom CSS Glass tokens
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Area, Bar, Line, Pie/Donut)
- **3D Graphics**: Three.js + `@react-three/fiber` + `@react-three/drei`
- **Effects**: Canvas Confetti

### Backend
- **Language**: Go (Golang) 1.27+
- **Web Framework**: Gin (`github.com/gin-gonic/gin`)
- **Authentication**: JWT (`github.com/golang-jwt/jwt/v5`)
- **Cryptography**: `golang.org/x/crypto/bcrypt`
- **Real-Time Hub**: Gorilla WebSocket (`github.com/gorilla/websocket`)
- **Database Driver**: Official MongoDB Go Driver (`go.mongodb.org/mongo-driver/mongo`)
- **Database**: MongoDB / MongoDB Atlas (with seamless in-memory fallback)

---

## 📁 Project Architecture & Folder Structure

```
ExpenseFlow/
├── frontend/
│   ├── src/
│   │   ├── animations/     # Reusable Framer Motion variants
│   │   ├── components/     # Navbar, Sidebar, MobileNav, Toast, Skeleton, Modals
│   │   ├── context/        # AppContext (Auth, Expenses, Groups, WebSockets)
│   │   ├── data/           # Realistic Indian Rupee mock & seed data
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # Layout wrappers
│   │   ├── pages/          # Landing, Login, Register, Dashboard, Expenses, Groups,
│   │   │                   # GroupDetails, Settlements, Analytics, Profile, Settings, 404
│   │   ├── services/       # Centralized API service with offline fallback
│   │   ├── three/          # 3D FloatingCard and FinancialOrb components
│   │   ├── utils/          # Currency formatters (₹ INR), date helpers
│   │   ├── App.jsx         # App router and view controller
│   │   ├── main.jsx        # React root entry
│   │   └── index.css       # Tailwind base, dark/light CSS variables
│   ├── public/             # Static public assets
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── backend/
│   ├── cmd/                # Alternative entrypoints
│   ├── config/             # Environment variable and config loader
│   ├── controllers/        # Auth, User, Expense, Group, Settlement, Analytics, Notif
│   ├── middleware/         # JWT Auth, CORS headers
│   ├── models/             # Domain structs, DTOs, and BSON/JSON tags
│   ├── repositories/       # MongoDB driver & thread-safe in-memory repository
│   ├── routes/             # REST endpoints and WebSocket route setup
│   ├── services/           # Split verification, debt recalculation, settlements
│   ├── utils/              # Password hashing, JWT token generator, API responses
│   ├── websocket/          # Hub, Client read/write pumps, broadcast dispatcher
│   ├── main.go             # Application entrypoint
│   ├── go.mod              # Go dependencies
│   ├── go.sum
│   └── .env.example        # Environment variable template
│
└── README.md
```

---

## ⚡ Getting Started Locally

### Prerequisites
- **Node.js**: v18+ (tested with v24)
- **Go**: v1.21+ (tested with v1.27)
- **MongoDB** *(Optional)*: Local MongoDB or MongoDB Atlas connection string. (If omitted, the server runs with built-in high-performance memory storage pre-seeded with sample data).

---

### 1. Backend Setup

```bash
cd ExpenseFlow/backend

# Copy environment template
copy .env.example .env

# Run the Go server (compiles and runs immediately)
go run main.go
```
The backend server will start on `http://localhost:8080`.

---

### 2. Frontend Setup

In a new terminal:
```bash
cd ExpenseFlow/frontend

# Install dependencies (if not already installed)
npm install --legacy-peer-deps

# Start Vite dev server
npm run dev
```
Open your browser and navigate to:
👉 **`http://localhost:5173`**

---

## 🔐 Demo Accounts

| Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Gayathiri** | `gayathiri@expenseflow.dev` | `password123` | Admin & Creator |
| **Priya** | `priya@expenseflow.dev` | `password123` | Group Member |
| **Anu** | `anu@expenseflow.dev` | `password123` | Group Member |
| **Divya** | `divya@expenseflow.dev` | `password123` | Group Member |

*(You can also click the **"Quick Demo Accounts"** buttons on the Login page for one-click access!)*

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/register` — Register a new user account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated profile
- `POST /api/auth/logout` — Terminate session

### Expenses
- `GET /api/expenses` — Query expenses (filters: `category`, `splitType`, `search`)
- `GET /api/expenses/:id` — Get single expense detail
- `POST /api/expenses` — Record a new expense (validates equal/custom/percentage splits)
- `PUT /api/expenses/:id` — Update existing expense
- `DELETE /api/expenses/:id` — Remove expense & recalculate group balances

### Groups
- `GET /api/groups` — List user's groups
- `GET /api/groups/:id` — Get group info with member net balances
- `POST /api/groups` — Create a new group
- `PUT /api/groups/:id` — Update group metadata
- `DELETE /api/groups/:id` — Delete group
- `POST /api/groups/:id/members` — Add member to group
- `DELETE /api/groups/:id/members/:userId` — Remove member

### Settlements
- `GET /api/settlements` — List pending and settled transactions
- `POST /api/settlements` — Initiate a settlement
- `PUT /api/settlements/:id/settle` — Mark settlement as settled & update ledgers

### Analytics
- `GET /api/analytics/summary` — Aggregate summary (Total, You Owe, You Are Owed, Settled)
- `GET /api/analytics/monthly` — Monthly expense progression
- `GET /api/analytics/categories` — Spend by category

### Real-Time WebSocket
- `GET /api/ws` — WebSocket upgrade endpoint for live updates

---

## 📦 Build Commands

### Frontend Production Bundle
```bash
cd ExpenseFlow/frontend
npm run build
```
Creates an optimized static production distribution in `dist/`.

### Backend Binary Build
```bash
cd ExpenseFlow/backend
go build -o server.exe .
```

---

## 🌟 Future Improvements
- Multi-currency conversion with live forex rates (USD, EUR, GBP to INR).
- Receipt scanning with Optical Character Recognition (OCR).
- Direct UPI Deep-linking via QR code scanning on mobile.
- PDF and CSV ledger export for tax and recordkeeping.

---

Designed with precision for recruiters, clients, and technical demonstrations. Built with Go, Gin, React, Vite, and MongoDB.
