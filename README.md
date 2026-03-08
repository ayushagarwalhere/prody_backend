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

1. Copy `.env.example` to `.env` and set values (database, Redis, JWT secrets, Resend, etc.).
2. Install dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run migrations (requires running PostgreSQL): `npx prisma migrate deploy`  
   For a fresh DB you can use `npx prisma migrate reset` if you need to reset.
5. Start the server: `bun run dev` (or `npm run dev`)

## Scripts

- `bun run dev` – start dev server
- `npm run start` – start production server
- `npx prisma migrate dev` – create/apply migrations (dev)
- `npx prisma generate` – generate Prisma client
- `npx prisma studio` – open Prisma Studio

## API overview

- **Auth:** `/auth` – register, login, logout, refresh, verify-email, forgot-password, reset-password
- **User:** `/user/profile` – profile (teams, events, avatar)
- **Events:** `/events` – list, get by id, create (admin), register (solo/team)
- **Teams:** `/teams` – create, join, remove-member, submit
- **Leaderboard:** `/leaderboard/:eventId`
- **Admin:** `/admin/score` – set team score for an event

See **CURL_EXAMPLES.md** for example requests.