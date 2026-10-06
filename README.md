# 🏪 Full Stack Store Rating Web Application

A full-stack web application designed for browsing, managing, and rating stores with role-based access control (Admin, Normal User, and Store Owner), strict input validations, sorting, filtering, and real-time rating submission and modification.

---

## 📌 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technologies Used](#-technologies-used)
3. [User Roles & Permissions](#-user-roles--permissions)
4. [Mandatory Validations](#-mandatory-validations)
5. [Database Schema](#-database-schema)
6. [Setup Instructions & Database Setup](#-setup-instructions--database-setup)
7. [Default Seed Credentials](#-default-seed-credentials)
8. [Features Implemented](#-features-implemented)
9. [How to Run the Project](#-how-to-run-the-project)
10. [Running Automated Tests](#-running-automated-tests)
11. [Project Structure](#-project-structure)

---

## 🌟 Project Overview

The **Store Rating Web Application** provides a single unified login portal that seamlessly directs users to their dedicated interface based on their assigned role:
- **System Administrators**: Oversee the entire system, track platform-wide metrics (users, stores, ratings), register new stores and users, inspect complete user profiles, view store owner performance, and filter/sort tables.
- **Normal Users**: Discover stores, search by store name or address, sort stores by rating/name, submit 1–5 star ratings, modify their submitted rating at any time, and update their account passwords.
- **Store Owners**: Access a dedicated dashboard showing their managed store's average rating, total ratings count, and an itemized breakdown of customers who rated their store.

---

## 💻 Technologies Used

- **Frontend**:
  - ReactJS (React 18) with Vite
  - Tailwind CSS for modern, responsive UI design
  - Lucide React for consistent icons
  - Axios for HTTP communication with JWT interceptors
  - React Router DOM (v6) for declarative routing & role-based route guards

- **Backend**:
  - ExpressJS (Node.js REST API)
  - Prisma ORM (Type-safe database migrations & relational querying)
  - JSON Web Tokens (JWT) for stateless authentication
  - bcryptjs for password hashing with salt
  - CORS and Dotenv

- **Database**:
  - PostgreSQL (Local server or Cloud PostgreSQL instance)

- **Version Control & Testing**:
  - Git
  - Jest & Supertest for backend integration & validation test suite

---

## 👥 User Roles & Permissions

| Role | Permissions & Capabilities |
|---|---|
| 👨‍💼 **System Administrator (`ADMIN`)** | • View system dashboard metrics (Total Users, Stores, Ratings)<br>• Add new stores and assign store owners<br>• Add new users (Admin, Normal User, Store Owner)<br>• View all stores with overall ratings & sort/search<br>• View all users with search, role filtering, and sort<br>• View detailed user profile modal (stores, ratings)<br>• View store owner rating summaries & customer reviews<br>• Change password and logout |
| 👤 **Normal User (`USER`)** | • Sign up with real-time validation checks<br>• View all registered stores<br>• Search stores by name or address<br>• Sort stores ascending/descending by name or rating<br>• View overall store rating and personal submitted rating<br>• Submit 1–5 star ratings and modify existing ratings<br>• Change password and logout |
| 🏪 **Store Owner (`STORE_OWNER`)** | • Log in to a dedicated Store Owner portal<br>• View store details and current average rating<br>• View list of users who submitted ratings with timestamps<br>• Search and sort customer ratings<br>• Change password and logout |

---

## ✅ Mandatory Validations

Both client-side forms and server-side validation middlewares enforce these strict rules:

| Field | Validation Requirement | Enforcement |
|---|---|---|
| **Name** | Must be between **20 and 60 characters** | Client validation + Backend regex/length check |
| **Address** | Maximum **400 characters** | Client validation + Backend length check |
| **Password** | **8–16 characters**, including at least **1 uppercase letter** and **1 special character** | Real-time requirement badges + Backend regex check |
| **Email** | Standard email syntax (`example@domain.com`) | Client validation + Backend regex check |
| **Rating** | Integer between **1 and 5 only** | Star picker widget + Backend integer constraint check |

---

## 🗄️ Database Schema

The database consists of three relational tables managed by Prisma:

```prisma
enum Role {
  ADMIN
  USER
  STORE_OWNER
}

model User {
  id        String   @id @default(uuid())
  name      String   // 20 to 60 characters
  email     String   @unique
  password  String   // Hashed bcrypt string
  address   String   // Max 400 characters
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  stores    Store[]  @relation("StoreOwner")
  ratings   Rating[]
}

model Store {
  id        String   @id @default(uuid())
  name      String   // 20 to 60 characters
  email     String   @unique
  address   String   // Max 400 characters
  ownerId   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner     User?    @relation("StoreOwner", fields: [ownerId], references: [id], onDelete: SetNull)
  ratings   Rating[]
}

model Rating {
  id        String   @id @default(uuid())
  rating    Int      // 1 to 5
  userId    String
  storeId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  store     Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@unique([userId, storeId]) // Ensures each user has at most 1 rating per store, allowing updates
}
```

---

## 🚀 Setup Instructions & Database Setup

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node.js v22)
- **PostgreSQL**: PostgreSQL 14+ running locally or in the cloud

### 2. Configure Environment Variables
Inside `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:root123@localhost:5432/store_rating_db?schema=public"
JWT_SECRET="super_secret_store_rating_jwt_key_2026"
PORT=5000
```
*(Adjust the username `postgres`, password `root123`, and port `5432` to match your local PostgreSQL configuration).*

### 3. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or run `npm install` inside both `backend` and `frontend` folders).*

### 4. Database Migration & Push
Navigate to `backend` and push the schema:
```bash
cd backend
npx prisma db push
```

### 5. Seed Initial Data
Seed the database with sample admin, store owners, users, stores, and ratings:
```bash
npm run seed
```

---

## 🔑 Default Seed Credentials

For quick evaluation, pre-configured accounts satisfying all character constraints are provided:

| Role | Email | Password | Name (20–60 chars) |
|---|---|---|---|
| 👨‍💼 **System Administrator** | `admin@storerating.com` | `Admin@12345` | System Administrator Master |
| 🏪 **Store Owner** | `owner@storerating.com` | `Owner@12345` | Store Owner Professional One |
| 👤 **Normal User** | `alice@storerating.com` | `User@12345` | Alice Johnson Smithfield |

> 💡 **Tip**: On the login page, you can click the **Quick Test Credentials** buttons to instantly fill in any of these test accounts.

---

## ⚡ Features Implemented

### 🛡️ Authentication & Authorization
- Single unified login page with role detection.
- Protected client-side routes redirect unauthorized attempts to the appropriate dashboard.
- Password change modal with real-time requirement indicators (8–16 chars, uppercase, special character).

### 👨‍💼 Admin Module
- **Metrics Overview**: Real-time counter for Total Users, Total Stores, and Total Ratings.
- **Store Management**: Create stores, assign store owners, view stores with calculated overall rating and total rating count.
- **User Management**: Add new Admin, User, or Store Owner accounts; filter by role (`ALL`, `ADMIN`, `USER`, `STORE_OWNER`); search by name, email, or address.
- **User Details Modal**: Deep inspection of any user's profile, including their owned stores or rating history.
- **Store Owner Ratings Inspection**: View each store owner's stores, computed average ratings, and itemized customer reviews.
- **Sorting**: Toggle ascending/descending order on any column header.

### 👤 Normal User Module
- **Store Browsing**: Browse all registered stores with average rating stars.
- **Search & Sort**: Search by store name or address; sort ascending/descending by name or rating.
- **Rating Widget**: Interactive 1–5 star rating widget displaying overall rating and current user's submitted rating.
- **Modify Rating**: Users can click any star to submit a new rating or modify an existing rating with instant calculation.

### 🏪 Store Owner Module
- **Store Performance Card**: View store details, overall rating, and total rating counts.
- **Customer Ratings List**: View customer names, emails, submitted star ratings, and dates.
- **Search & Sort**: Search reviews by customer name/email, and sort by rating, name, or date.

---

## 🏃 How to Run the Project

### Option A: Run Both Together from Project Root

1. **Start Backend**:
   ```bash
   npm run dev:backend
   ```
   *Backend runs on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)*

2. **In a second terminal, start Frontend**:
   ```bash
   npm run dev:frontend
   ```
   *Frontend opens on `http://localhost:5173`*

### Option B: Run Individually

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 🧪 Running Automated Tests

A comprehensive integration test suite verifies:
- Validation rules (rejecting names < 20 or > 60 chars, invalid passwords, bad emails, invalid ratings)
- Role-based authorization (403 for unauthorized routes)
- Rating submission and modification (atomic upsert)
- Admin statistics and listing
- Store owner dashboard

Run tests from the root directory:
```bash
npm run test
```
*(Or `cd backend && npm test`)*

---

## 📁 Project Structure

```
Roxilar-project/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma             # PostgreSQL schema with User, Store, Rating models
│   │   └── seed.js                   # Seed data with default roles and demo stores
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── adminController.js    # Admin stats, user/store CRUD, owner ratings
│   │   │   ├── authController.js     # Login, signup, password updates
│   │   │   ├── ownerController.js    # Store owner dashboard and customer review queries
│   │   │   ├── ratingController.js   # Rating submission & modification
│   │   │   └── storeController.js    # Store listing, search, sorting
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js     # JWT verification middleware
│   │   │   ├── optionalAuthMiddleware.js
│   │   │   ├── roleMiddleware.js     # Role-based access control middleware
│   │   │   └── validator.js          # Mandatory validation rules (Name, Password, etc.)
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── ownerRoutes.js
│   │   │   ├── ratingRoutes.js
│   │   │   └── storeRoutes.js
│   │   ├── app.js                    # Express application configuration
│   │   ├── prisma.js                 # Prisma Client singleton
│   │   └── server.js                 # Express server entrypoint
│   ├── tests/
│   │   └── api.test.js               # Jest & Supertest automated test suite
│   ├── .env                          # PostgreSQL connection & JWT secret
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js             # Axios instance with auth interceptors
│   │   ├── components/
│   │   │   ├── AddStoreModal.jsx     # Admin Add Store modal
│   │   │   ├── AddUserModal.jsx      # Admin Add User modal
│   │   │   ├── ChangePasswordModal.jsx # Password update with criteria badges
│   │   │   ├── Navbar.jsx            # Top navigation with role badge & logout
│   │   │   ├── ProtectedRoute.jsx    # Role-based route guard
│   │   │   ├── StarRating.jsx        # 1-5 star interactive & display component
│   │   │   └── UserDetailsModal.jsx  # Detailed user profile viewer
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global authentication state
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx    # Metrics, stores, users, owner ratings
│   │   │   ├── Login.jsx             # Unified login with demo credential buttons
│   │   │   ├── OwnerDashboard.jsx    # Store owner rating monitor
│   │   │   ├── Signup.jsx            # Normal user registration
│   │   │   └── UserDashboard.jsx     # Store browsing & rating modification
│   │   ├── App.jsx                   # React Router route definitions
│   │   ├── index.css                 # Tailwind CSS styling
│   │   └── main.jsx                  # React DOM entrypoint
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── package.json                      # Root helper scripts
├── README.md                         # Project documentation
└── .gitignore
```
