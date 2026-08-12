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

## Deployment troubleshooting

### Azure + Prisma
This backend is configured for both the local/native Prisma engine and Azure Linux:

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

After pulling the project, run:

```bash
npm ci
npx prisma generate
```

For Azure App Service, Node 20 LTS is recommended for this Prisma 5.22 project.

### Frontend API URL
The frontend is a separate repository. In Vercel, use the full Azure URL, including `https://`:

```text
NEXT_PUBLIC_API_URL=https://YOUR-APP.azurewebsites.net/api
NEXT_PUBLIC_SOCKET_URL=https://YOUR-APP.azurewebsites.net
```

Do not use the Azure hostname as a relative path and do not leave `localhost:5000` hard-coded in production Socket.IO code.
