# Bus Eka — Sri Lanka Smart Transportation Backend API

Express.js + Prisma ORM + PostgreSQL + Socket.IO backend service for Bus Eka.

## Setup & Run Instructions

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` points to your PostgreSQL instance (e.g. `postgresql://postgres:password@localhost:5432/bus_eka?schema=public`).

### 2. Install Dependencies
```bash
npm install
```

### 3. Synchronize Database & Seed Demo Data
```bash
npx prisma db push
node prisma/seed.js
```

### 4. Start Server
```bash
npm run dev
# Server will run on http://localhost:5000
```

## Demo Credentials (Password: `password123`)
- **Admin**: `admin@buseka.lk`
- **Bus Owner**: `owner@buseka.lk`
- **Driver**: `driver@buseka.lk`
- **Conductor**: `conductor@buseka.lk`
- **Passenger**: `passenger@buseka.lk`
