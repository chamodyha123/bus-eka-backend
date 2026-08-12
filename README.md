# 🚌 Bus Eka — Sri Lanka Smart Transportation Backend API

> **Express.js + Prisma ORM + PostgreSQL + Socket.IO backend service for Bus Eka**

Bus Eka is a smart digital transportation platform designed to modernize public bus transportation in Sri Lanka.

This repository contains the **backend REST API and real-time communication services** powering the Bus Eka platform.

The backend provides APIs for authentication, users, buses, routes, trips, seats, bookings, payments, tickets, GPS tracking, crowd reporting, emergency reporting, and administration.

---

## 🌐 Live Bus Eka Application

The complete Bus Eka system is deployed and available online.

### 🚍 Live Frontend

**https://bus-eka-frontend.vercel.app/**

The frontend is hosted on **Vercel** and communicates with the production backend API deployed on **Microsoft Azure**.

```text
                    BUS EKA
                       │
                       ▼
          ┌────────────────────────┐
          │   Next.js Frontend     │
          │        Vercel          │
          └────────────┬───────────┘
                       │
                 HTTPS / REST
                       │
                       ▼
          ┌────────────────────────┐
          │    Backend API         │
          │   Microsoft Azure      │
          │ Express + Socket.IO    │
          └────────────┬───────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │      PostgreSQL        │
          │       Database         │
          └────────────────────────┘
```

### 🚀 Deployment

| Component               | Technology           | Hosting            |
| ----------------------- | -------------------- | ------------------ |
| Frontend                | Next.js              | Vercel             |
| Backend API             | Node.js + Express.js | Microsoft Azure    |
| Real-time Communication | Socket.IO            | Microsoft Azure    |
| Database                | PostgreSQL           | PostgreSQL hosting |

---

# ✨ Backend Features

The Bus Eka backend provides the following functionality:

### 🔐 Authentication & Authorization

* JWT-based authentication
* User registration
* User login
* Role-based access control
* Protected API routes
* Password hashing

### 👤 User Management

* Passenger management
* Bus owner management
* Driver management
* Conductor management
* Administrator management
* Role-based profiles

### 🚌 Bus Management

* Register buses
* Update bus information
* Delete buses
* Bus ownership management
* Bus status management
* Driver and conductor assignment

### 🗺️ Route Management

* Route creation
* Route information
* Origin and destination
* Bus route management
* Route-based trip scheduling

### 📅 Trip Management

* Trip templates
* Daily trips
* Trip schedules
* Bus assignment
* Route assignment
* Trip status management
* Automated trip generation

### 💺 Seat Management

* Trip-specific seat management
* Seat availability
* Seat locking
* Seat expiration
* Seat reservation

### 🎫 Booking System

* Passenger bookings
* Booking management
* Booking history
* Upcoming journeys
* Ticket generation

### 💳 Payment

* Mock payment processing
* Payment status management
* Booking/payment integration

> The current payment implementation is intended for academic demonstration and testing.

### 📱 QR Ticket Verification

* QR ticket generation
* QR ticket validation
* Manual ticket verification fallback
* Ticket status checking

### 📍 Real-Time Tracking

Socket.IO is used for real-time communication features such as:

* Driver GPS location broadcasting
* Live bus tracking
* Real-time updates

### 🚨 Emergency Reporting

Drivers can report incidents such as:

* Accidents
* Vehicle breakdowns
* Medical emergencies
* Security incidents

### 👥 Crowd Information

Conductors can update passenger/crowd density information for active trips.

### 📊 Administration

Administrators can access:

* Platform statistics
* User management
* System monitoring
* Operational information
* KPI information

---

# 🛠️ Technology Stack

| Technology      | Purpose                            |
| --------------- | ---------------------------------- |
| Node.js         | Backend runtime                    |
| Express.js      | REST API framework                 |
| Prisma ORM      | Database ORM                       |
| PostgreSQL      | Relational database                |
| Socket.IO       | Real-time communication            |
| JWT             | Authentication                     |
| bcrypt          | Password hashing                   |
| QR Code         | Ticket generation and verification |
| node-cron       | Scheduled tasks                    |
| CORS            | Cross-origin communication         |
| Microsoft Azure | Backend deployment                 |

---

# 📁 Project Structure

```text
bus-eka-backend/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

# ⚙️ Setup & Run Instructions

## 1. Configure Environment Variables

Copy `.env.example` to `.env`.

### Linux / macOS

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Configure your PostgreSQL connection:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bus_eka?schema=public"
```

Additional environment variables may include:

```env
PORT=5000
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Never commit the real `.env` file to GitHub.

---

# 📦 2. Install Dependencies

```bash
npm install
```

For a clean production installation:

```bash
npm ci
```

---

# 🗄️ 3. Synchronize Database

Generate Prisma Client:

```bash
npx prisma generate
```

Synchronize the Prisma schema with PostgreSQL:

```bash
npx prisma db push
```

---

# 🌱 4. Seed Demo Data

Run:

```bash
node prisma/seed.js
```

The seed script creates demonstration data including:

* Users
* Roles
* Buses
* Routes
* Trip templates
* Trips
* Sample transportation data

---

# ▶️ 5. Start Server

Development mode:

```bash
npm run dev
```

The server will normally run at:

```text
http://localhost:5000
```

Production mode:

```bash
npm start
```

---

# 🔑 Demo Credentials

The seed database contains demo accounts for each major role.

**Password for all demo accounts:**

```text
password123
```

| Role      | Email                 |
| --------- | --------------------- |
| Admin     | `admin@buseka.lk`     |
| Bus Owner | `owner@buseka.lk`     |
| Driver    | `driver@buseka.lk`    |
| Conductor | `conductor@buseka.lk` |
| Passenger | `passenger@buseka.lk` |

> These credentials are intended for demonstration/testing environments only. Do not use them for a production deployment.

---

# 🔐 Authentication

Protected endpoints use JWT authentication.

Include the token in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Example:

```http
GET /api/admin/stats
Authorization: Bearer eyJhbGciOi...
```

---

# 🔄 Booking Architecture

The booking process follows:

```text
Passenger
    ↓
Search Trips
    ↓
Select Trip
    ↓
View Seat Map
    ↓
Lock Seat
    ↓
Checkout
    ↓
Mock Payment
    ↓
Create Booking
    ↓
Generate QR Ticket
    ↓
Ticket Verification
```

Seat locking includes expiration handling to prevent permanently locked seats.

---

# 🔌 Socket.IO

Bus Eka uses Socket.IO for real-time functionality.

The frontend connects to the Socket.IO server using the production backend URL.

Example:

```env
NEXT_PUBLIC_SOCKET_URL=https://YOUR-APP.azurewebsites.net
```

Socket.IO can be used for:

* Live driver location
* Bus tracking
* Real-time trip updates
* Operational updates

---

# ☁️ Production Deployment

The Bus Eka backend is deployed using **Microsoft Azure App Service**.

The frontend is deployed separately using **Vercel**.

### Production Architecture

```text
GitHub
   │
   ├───────────────┐
   │               │
   ▼               ▼
Vercel          Azure App Service
   │               │
   │               ├── Express.js
   │               ├── Socket.IO
   │               └── Prisma
   │                       │
   │                       ▼
   │                  PostgreSQL
   │
   ▼
Bus Eka Web Application
```

---

# 🔧 Azure + Prisma

This backend is configured for both the local/native Prisma engine and Azure Linux.

The Prisma generator uses:

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

After pulling the project:

```bash
npm ci
npx prisma generate
```

### Recommended Node.js Version

For this Prisma 5.22 project, **Node.js 20 LTS** is recommended for Azure App Service.

---

# 🌐 Frontend API Configuration

The frontend is maintained in a separate repository and deployed through Vercel.

For the Vercel production environment, configure:

```env
NEXT_PUBLIC_API_URL=https://YOUR-APP.azurewebsites.net/api
NEXT_PUBLIC_SOCKET_URL=https://YOUR-APP.azurewebsites.net
```

### Important

Use the complete HTTPS URL.

Correct:

```text
https://YOUR-APP.azurewebsites.net/api
```

Incorrect:

```text
YOUR-APP.azurewebsites.net/api
```

Incorrect:

```text
localhost:5000/api
```

The production frontend should never use `localhost` for the deployed backend.

---

# 🔗 Frontend Repository

The Bus Eka frontend is maintained separately using Next.js.

**Frontend:**
https://bus-eka-frontend.vercel.app/

Replace the repository link below with the actual GitHub repository:

```text
Bus Eka Frontend
https://github.com/YOUR_USERNAME/bus-eka-frontend
```

---

# 🧪 API Testing

The backend API can be tested using:

* Postman
* Insomnia
* Browser Developer Tools
* Frontend application
* Swagger, if enabled

Example:

```http
GET /api/trips
```

Protected endpoint:

```http
GET /api/admin/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# 🐛 Deployment Troubleshooting

## Prisma Client Error

If Azure reports:

```text
Cannot find module '.prisma/client'
```

run:

```bash
npm ci
npx prisma generate
```

Ensure the Prisma binary targets include:

```prisma
binaryTargets = ["native", "debian-openssl-3.0.x"]
```

---

## 401 Unauthorized

A `401 Unauthorized` response generally indicates an authentication problem.

Check:

* JWT token exists
* JWT token is valid
* JWT token has not expired
* Authorization header is correctly formatted
* User has the required role
* Frontend is using the correct backend URL

Correct:

```http
Authorization: Bearer YOUR_TOKEN
```

---

## CORS Issues

If the deployed frontend cannot communicate with the backend, check the backend CORS configuration.

The Vercel frontend domain should be allowed:

```text
https://bus-eka-frontend.vercel.app
```

Make sure the production frontend is not accidentally calling:

```text
http://localhost:5000
```

---

# 🔒 Security

The project follows several security practices:

* JWT authentication
* Password hashing
* Role-based authorization
* Protected routes
* Environment variables
* CORS configuration
* Database constraints
* Server-side validation

Never commit:

```text
.env
JWT secrets
Database passwords
API keys
Payment credentials
Private credentials
```

to GitHub.

---

# 📊 Database

Bus Eka uses PostgreSQL with Prisma ORM.

The core system relationships can be represented as:

```text
User
 │
 ├── Passenger
 ├── Bus Owner
 ├── Driver
 └── Conductor
        │
        ▼
       Trip
        │
        ├── Bus
        ├── Route
        ├── Seats
        └── Bookings
                │
                ├── Payment
                └── Ticket
```

---

# 🚀 Deployment Status

| Component           | Status                        |
| ------------------- | ----------------------------- |
| Frontend            | ✅ Deployed on Vercel          |
| Backend API         | ✅ Deployed on Microsoft Azure |
| PostgreSQL          | ✅ Configured                  |
| Prisma ORM          | ✅ Configured                  |
| JWT Authentication  | ✅ Implemented                 |
| Role-Based Access   | ✅ Implemented                 |
| Booking System      | ✅ Implemented                 |
| Seat Locking        | ✅ Implemented                 |
| Mock Payments       | ✅ Implemented                 |
| QR Tickets          | ✅ Implemented                 |
| Socket.IO           | ✅ Implemented                 |
| GPS Tracking        | ✅ Implemented                 |
| Emergency Reporting | ✅ Implemented                 |
| Crowd Reporting     | ✅ Implemented                 |

---

# 🔮 Future Improvements

Possible future improvements include:

* Real payment gateway integration
* Advanced real-time GPS infrastructure
* Mobile application
* Push notifications
* AI-based ETA prediction
* Route recommendations
* Advanced analytics
* Passenger ratings and reviews
* WebSocket-based real-time notifications
* Automated testing
* Refresh-token authentication
* Production monitoring and logging

---

# 📄 License

Bus Eka is proprietary software.

Copyright © 2026 **Chamodyha Peshan Kehelgamuwa**.

All rights reserved.

The source code is available for viewing but is not licensed for copying, redistribution, rebranding, modification, commercial use, or submission as another person's work without prior written permission.

---

# 👨‍💻 Author

**Chamodyha Peshan Kehelgamuwa**

Software Engineering Undergraduate
NSBM Green University

---

# 🚌 Bus Eka

> **A Smart Digital Platform for Sri Lankan Public Bus Transportation**

Bus Eka aims to make public transportation in Sri Lanka **smarter, safer, more convenient, and digitally connected**.

### 🌐 Live Application

**https://bus-eka-frontend.vercel.app/**
