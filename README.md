# ERP-Yousra

Backend API for the Yousra ERP. It currently covers HR (employees, families, contracts, positions and skills), authentication, user accounts, and the shared company structure (companies and departments).

**Working on the code?** Read the [developer manual](source/claude/developer-manual.md). It shows where everything lives, the URL map, the matricule rules, the house style and how to run the tests.

## Stack

- [Bun](https://bun.sh) runtime
- Express 5
- Prisma 7 on PostgreSQL. Locally that's Supabase, at `127.0.0.1:54322`.
- Zod for validation, jose for JWT tokens
- Doppler for secrets (no `.env` files are committed)

## Getting started

1. Install the dependencies:
   ```
   bun install
   ```
2. Start the local database. You need the Supabase CLI, and the config is in `supabase/`.
   ```
   supabase start
   ```
3. Make sure your Doppler `dev` config has `DATABASE_URL`, `DIRECT_URL` and `JWT_SECRET`.
4. Apply the migrations and generate the Prisma client:
   ```
   bun run migrate
   bun run generate
   ```
5. Run the API:
   ```
   bun run dev
   ```
   It listens on port 5000 unless `PORT` is set. `GET /` answers `Yousra ERP API`.

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | starts the API with auto-reload |
| `bun run start` | starts the API without auto-reload |
| `bun run migrate` | `prisma migrate dev` |
| `bun run generate` | regenerates the Prisma client in `generated/prisma` |
| `bun run studio` | opens Prisma Studio |
| `bun run test` | runs the test suite against the **dev** database |

> ⚠️ `bun run test` **deletes every row** in the database it runs against. It uses the Doppler `dev` config, which must point at your local, throwaway database. Never at stg or prd.

## API at a glance

All routes are under `/api/v1`. Every route except `/auth` needs a `Bearer` token.

| Prefix | Purpose |
|---|---|
| `/auth` | login, change password |
| `/admin/users` | user accounts (Admin, HR) |
| `/hr/employees` | employees and their spouses, children, parents, contacts, credentials, skills, positions and contracts |
| `/hr/positions`, `/hr/skills`, `/hr/contracts` | positions, the skill catalog, contract reports |
| `/company/companies`, `/company/departments` | org structure |

Any logged-in user can read; writes need the HR role. The full route list is in the [developer manual](source/claude/developer-manual.md#3-url-map).

**Frontend / API clients:** every endpoint, request body and response is described in the OpenAPI spec [source/claude/openapi.yaml](source/claude/openapi.yaml). Open it in Swagger Editor or Postman, or feed it to an AI assistant or a client generator.

## Project layout

```
prisma/            database schema and migrations
generated/prisma/  generated Prisma client (don't edit)
supabase/          local Supabase config
source/
  app.ts           mounts the modules
  server.ts        starts the server
  lib/             auth middleware, JWT, passwords, prisma client
  modules/         auth, admin/users, company, hr
  __tests__/       bun:test + supertest suites
  claude/          developer manual, session notes, briefs
```
