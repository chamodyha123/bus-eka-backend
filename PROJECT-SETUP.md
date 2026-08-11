# Bus Eka – Completed Source Package

## Included
- `bus-eka-backend`: Express, Prisma, PostgreSQL, JWT, Socket.IO and scheduled jobs.
- `bus-eka-frontend`: Next.js App Router frontend with responsive passenger, owner, driver, conductor and admin areas.

## Important trip scheduling behavior
1. An owner creates a recurring Trip Template.
2. The API immediately creates today's Trip when today is one of the template's active days.
3. The backend also runs trip generation at server startup and every day at midnight in `Asia/Colombo`.
4. Generation is idempotent: restarting the server does not create duplicate trips.
5. Passengers book dated `Trip` records, never templates.

## Backend setup
```bash
cd bus-eka-backend
copy .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```
Update `DATABASE_URL` and `JWT_SECRET` in `.env` first.

## Frontend setup
```bash
cd bus-eka-frontend
copy .env.example .env.local
npm install
npm run dev
```
The frontend opens on `http://localhost:3000`; the backend defaults to `http://localhost:5000`.

## Suggested first run
```bash
cd bus-eka-backend
npx prisma db seed
```
Then sign in using accounts provided by the seed file, or register a new account.

## Production notes
- Use strong secrets and HTTPS.
- Configure CORS with the deployed frontend origin.
- Run Prisma migrations during deployment.
- Keep one scheduled-job instance active, or move cron work to a dedicated worker in a multi-instance deployment.
