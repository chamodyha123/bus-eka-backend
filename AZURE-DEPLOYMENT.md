# Bus Eka Backend - Azure App Service Deployment

## 1. App Service settings
Set these in Azure Portal -> App Service -> Environment variables.

Required:

- `NODE_ENV=production`
- `WEBSITE_NODE_DEFAULT_VERSION=20-lts` (recommended for Prisma 5.22.x)
- `PORT=8080` (App Service supplies PORT; leaving it unset is also fine)
- `APP_TIMEZONE=Asia/Colombo`
- `DATABASE_URL=<your Azure PostgreSQL connection string>`
- `JWT_SECRET=<strong secret>`
- `FRONTEND_URL=https://bus-eka-frontend.vercel.app`
- `CORS_ORIGINS=https://bus-eka-frontend.vercel.app`
- PayHere variables as required

Do not put the local PostgreSQL URL in Azure.

## 2. Startup command
Use:

```text
npm start
```

The project already has `postinstall: prisma generate`. The Prisma schema includes both the local/native engine and `debian-openssl-3.0.x`, so the Linux App Service can load Prisma correctly.

## 3. GitHub Actions
The backend repository is separate from the frontend repository. The workflow must deploy the **bus-eka-backend repository** to the Azure Web App.

A typical Node build should run:

```bash
npm ci
npx prisma generate
npm start
```

Do not deploy the frontend repository to this App Service.

## 4. Verify Azure
Open:

```text
https://YOUR-APP.azurewebsites.net/
https://YOUR-APP.azurewebsites.net/health
https://YOUR-APP.azurewebsites.net/api/health
```

You should receive JSON with `success: true`.

## 5. Correct frontend API URL
In the separate Next.js/Vercel frontend repository, set:

```text
NEXT_PUBLIC_API_URL=https://YOUR-APP.azurewebsites.net/api
NEXT_PUBLIC_SOCKET_URL=https://YOUR-APP.azurewebsites.net
```

Important: the value must include `https://`.

Wrong:

```text
NEXT_PUBLIC_API_URL=YOUR-APP.azurewebsites.net
```

That makes the browser interpret the Azure hostname as a path on the Vercel site, producing requests such as:

```text
https://bus-eka-frontend.vercel.app/YOUR-APP.azurewebsites.net/auth/login
```

Also make sure the frontend does not hard-code:

```text
http://localhost:5000
```

for Socket.IO in production.

## 6. API paths
Preferred paths:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/admin/stats`
- `GET /api/routes`
- `GET /api/buses`
- `GET /api/trips`
- Socket.IO: `https://YOUR-APP.azurewebsites.net/socket.io`

For compatibility, this backend also accepts the old root paths such as `/auth/login`, `/admin/stats`, and `/routes`.

## 7. Prisma migrations
For an existing production database, run migrations from a controlled deployment step:

```bash
npx prisma migrate deploy
```

Do not use `prisma migrate dev` against production.
