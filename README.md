# prody_backend

Production-grade backend for an **Event Signup Platform** built with Bun, Express, TypeScript, Prisma, PostgreSQL, Redis, and Resend.

## Stack

- **Runtime:** Bun
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Validation:** Zod
- **Cache / rate limit / sessions:** Redis
- **Email:** Resend

## Setup

1. Copy `.env.example` to `.env` and set values (database, Redis, JWT secrets, Resend, admin credentials, etc.).
2. Install dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run migrations (requires running PostgreSQL): `npx prisma migrate deploy`  
   For a fresh DB you can use `npx prisma migrate reset` if you need to reset.
5. **Seed admin user** (optional but recommended): `bun run prisma:seed`
6. Start the server: `bun run dev` (or `npm run dev`)

## Admin Seeding

The application includes a seed script to create the initial admin user. Set these environment variables in your `.env`:

```bash
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
ADMIN_EMAIL="admin@example.com"
```

Then run: `bun run prisma:seed`

This will create/update an admin user with the specified credentials, automatically verified and ready to use.

## Scripts

- `bun run dev` – start dev server
- `npm run start` – start production server
- `npx prisma migrate dev` – create/apply migrations (dev)
- `npx prisma migrate deploy` – apply migrations (production)
- `npx prisma generate` – generate Prisma client
- `npx prisma studio` – open Prisma Studio
- `bun run prisma:seed` – seed admin user

## API overview

- **Auth:** `/auth` – register, login, logout, refresh, verify-email, resend-verification, forgot-password, reset-password
- **User:** `/user/profile` – profile (teams, events, avatar)
- **Events:** `/events` – list, get by id, create (admin), edit (admin), register (solo/team), get registrations
- **Teams:** `/teams` – create, join, leave, remove-member, delete, get team, check user team for event
- **Leaderboard:** `/leaderboard/:eventId`
- **Admin:** `/admin/*` – user management, event management, score setting, CSV export

See **CURL_EXAMPLES.md** for detailed examples of all endpoints.