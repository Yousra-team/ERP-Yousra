# Claude Code brief — finish the HR module (ERP-Yousra)

You are working in the `ERP-Yousra` repo. The HR module is partially coded; your job is to **finish it** and **write unit tests for it**. Follow the author's existing style — mirror it closely. Do not refactor files that already work, do not introduce new patterns, do not add libraries. Keep code simple and easy to read.

---

## 1. Repository stack (do not change)

- **Runtime:** Bun
- **Framework:** Express 5
- **ORM:** Prisma 7 (client output at `generated/prisma`)
- **DB:** PostgreSQL via Supabase
- **Validation:** Zod v4 (`import * as z from "zod"`)
- **Password hashing:** `bcrypt` (via `source/lib/password.ts`)
- **JWT:** `jose` (via `source/lib/jwt.ts`)
- **Secrets:** Doppler (`doppler run -- ...` in `package.json` scripts)

Scripts in `package.json`:
- `bun run dev` → watches `source/server.ts`
- `bun run migrate` → `prisma migrate dev`
- `bun run generate` → `prisma generate`

---

## 2. Folder layout (already in place — keep it)

```
source/
  app.ts              ← stub: `app.use("/", ...)`. Needs real routing wired.
  server.ts           ← starts Express on PORT (default 5000)
  lib/
    prisma.ts
    password.ts       ← hashPassword, verifyPassword
    jwt.ts            ← signAccessToken, signRefreshToken, verifyToken
  modules/
    auth/
      auth.ts         ← partial: UserLogin works, changePassword empty
      authRouter.ts   ← missing default export + missing /logout, /refresh
      authSchema.ts   ← LoginSchema, updatePasswordSchema, linkUserToEmployeeSchema
    admin/
      users/
        user.ts       ← createUser, getUsers, getUserById, updateUser
        userRouter.ts ← missing default export
        userSchema.ts ← userSchema, updateUserSchema, roles[]
    hr/
      hrRouter.ts     ← has buggy paths (see §5). Needs default export.
      employees/
        employee.ts
        employee.schema.ts
        spouses/        spouse.ts, spouse.schema.ts
        children/       child.ts, childSchema.ts
        parents/        parent.ts, parentSchema.ts
        contacts/       contact.ts, contactSchema.ts
        credentials/    credential.ts, credentialSchema.ts
        employee-skills/      skills.ts, skillSchema.ts
        employee-positions/   position.ts, positionSchema.ts
        employee-contract/    (schema only, no controller yet)
prisma/
  schema.prisma       ← Employee, User, EmployeeSpouse, ..., Company, Department, Position, Skill, Contract
  migrations/         ← initial migration exists
```

Keep this layout. Do **not** restructure. When you add new files, put them where their siblings live.

---

## 3. Coding conventions — MIRROR exactly

Read `source/modules/hr/employees/employee.ts` and `source/modules/hr/employees/parents/parent.ts` to see the exact style. New code must match.

### 3.1 Controller shape (every handler)

```ts
export const handlerName = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. read params
        const matricule: string = req.params.matricule as string

        if(!matricule) {
            res.status(400).json({message: "Invalid Parameters"})
            return
        }

        // 2. (if body) validate with safeParse + flattenError
        const result = someSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }
        const data = result.data

        // 3. Prisma call
        const thing = await prisma.something.create({ data: { ...data } })

        // 4. respond
        res.status(200).json(thing)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
}
```

Keep this shape. Do not introduce:
- A response envelope like `{ success, data, message }` — handlers return plain objects or arrays.
- A central error handler. Each handler has its own try/catch.
- An `AppError` class or similar.
- Service-layer files (`.service.ts`). Controller files hold both HTTP handling and the Prisma call.

### 3.2 Validation

- `import * as z from "zod"` (never `import { z }`).
- One schema file per resource, co-located with the controller.
- For creates: define `xSchema`. For updates: derive with `.partial()` or `.omit({...})` — never re-declare.
- For enums, import the enum from `generated/prisma/enums`:
  ```ts
  import { ContractType } from "../../../../../generated/prisma/enums";
  // ...
  contractType: z.enum(ContractType)
  ```
- For dates always `z.coerce.date()`.
- For optional nullable fields: `z.string().nullable().optional()`.
- For phones: `z.e164()` (already used in `contactSchema.ts`).

### 3.3 Prisma transactions

Use `prisma.$transaction(async (tx) => { ... })` when the write spans two tables. Call with `await` at the top level — do NOT forget the `await` (the existing `createEmployee` and `addSpouse` are missing it; fix those as part of §5).

### 3.4 Status codes

- 200 for GET and PATCH success.
- 201 for POST create success.
- 204 is not used — always return the resource.
- 400 for bad params/bad schema.
- 404 when a resource lookup returns null.
- 409 for business rule conflicts (e.g. polygamy).
- 500 for any `catch`.

### 3.5 Router style

Mirror `hrRouter.ts`:

```ts
import { Router } from "express";
import { handlerA, handlerB } from "./some.controller";

const router = Router()

router.post("/" , handlerA)
router.get("/" , handlerB)

export default router    // ← always export default
```

The HR router is mounted at `/api/v1/hr/employees` (see §4 for app.ts wiring). That means `router.post("/")` in `hrRouter` resolves to `POST /api/v1/hr/employees`. Sub-paths follow from there.

### 3.6 Things that are NOT part of this style — don't add them

- No logger lib. Use `console.log(error)` in catch blocks (same as existing code).
- No class-based controllers.
- No dependency injection containers.
- No OpenAPI generation at runtime.
- No regex.
- No `.filter`/`.reduce` tricks when a plain loop is clearer.

---

## 4. Wire the app (first task)

`source/app.ts` is a stub. Replace it with real routing:

```ts
import express from "express"
import hrRouter from "./modules/hr/hrRouter"
import authRouter from "./modules/auth/authRouter"
import userRouter from "./modules/admin/users/userRouter"

const app = express()

app.use(express.json())

app.use("/api/v1/hr/employees", hrRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/admin/users", userRouter)

app.get("/", (req, res) => {
    res.send("Yousra ERP API")
})

export default app
```

Add `export default router` to the bottom of `hrRouter.ts`, `authRouter.ts`, and `userRouter.ts` (currently missing on all three).

---

## 5. HR module — bugs to fix (highest priority)

Fix these before adding anything new. Do each in its existing file.

### 5.1 `hrRouter.ts`

- `router.get("/matricule", getAnEmployee)` → must be `/:matricule`
- Children routes missing `/children/` segment:
  - `router.get("/:matricule/:childMatricule", getAChild)` → `/:matricule/children/:childMatricule`
  - `router.patch("/:matricule/:childMatricule", updateChild)` → `/:matricule/children/:childMatricule`
  - `router.delete("/:matricule/:childMatricule", DeleteChildren)` → `/:matricule/children/:childMatricule`
- Rename `DeleteChildren` → `deleteChild` (singular, camelCase) in both the controller and the router.
- Academic credentials — handlers swapped:
  - `router.get("/:matricule/academic-credentials", addCredential)` → should call `getCredentials`
  - `router.post("/:matricule/academic-credentials", getCredentials)` → should call `addCredential`
- Skills + positions prefix is doubled:
  - `router.get("/employees/:matricule/skills", getSkills)` → `/:matricule/skills`
  - Same for all `/employees/:matricule/...` lines in that file — strip the extra `/employees` since the router is already mounted under `/api/v1/hr/employees`.
- `router.get("/employees/:matricule/position/:assignmentId", getPosition)` → `/:matricule/positions/:assignmentId` (also singular → plural)
- Add `export default router` at the bottom.

### 5.2 `employee.ts` — `createEmployee`

- `createEmployeeAndUser` is declared but never awaited at the outer level. Change `const createEmployeeAndUser = await prisma.$transaction(...)` and remove the stray close pattern.
- `employeeMatricule: "SOONTOBEADDED"` — generate the matricule from `data.employeeMatricule` (which the schema validates). The caller supplies it. Remove the placeholder.
- The transaction currently creates the User even when the caller's `data.email` conflicts — wrap the `tx.user.create` inside the transaction so both roll back together. (The code already does this; just make sure the transaction awaits.)
- After the transaction succeeds, return the created employee (not just `{message: "..."}`).

### 5.3 `employee.ts` — `archiveEmployee`, `restoreEmployee`, `listArchivedEmployees`

- `archiveEmployee` body is incomplete after `const result = archiveEmployeeSchem` — finish it: validate the body with `archiveEmployeeSchema`, then `prisma.employee.update({ where: { employeeMatricule: matricule }, data: { isArchived: true, departureDate: data.effectiveDate } })`.
- `restoreEmployee` — implement: set `isArchived: false`, set `departureDate: null`.
- `listArchivedEmployees` — implement: `prisma.employee.findMany({ where: { isArchived: true } })`.

### 5.4 `spouse.ts` — `addSpouse`

- Polygamy check reads `employee.spouses` as a boolean but `spouses` is an array. Rewrite the check:
  ```ts
  const activeSpouseCount = employee.spouses.filter(s => s.isActive).length
  if (employee.marriageRegime === "MONOGAMOUS" && activeSpouseCount >= 1) {
      res.status(409).json({message: "Employee is monogamous and already has a spouse"})
      return
  }
  ```
- `const createMarriage = prisma.$transaction(...)` is missing `await`. Add it.
- `spouseMatricule: "DEFAULT"` — generate a real matricule. Use the pattern `SP-${YEAR}-${incrementing}`. For the first slice, accept the caller's `spouseMatricule` on the Zod schema and use that. (Spouses can have manual matricules since they often aren't in CNPS.)
- Return the created spouse, not the transaction promise.

### 5.5 `spouse.ts` — `endMarriage`

- Both `matricule` and `spouseMatricule` read from `req.params.matricule` — the second one must be `req.params.spouseMatricule`.
- The `where:` on the update should be `{ spouseMatricule, employeeMatricule: matricule }` (verify the spouse belongs to that employee).

### 5.6 `spouse.ts` — `getSpouse`, `listSpouses`

- Same `req.params.matricule` bug — fix both param reads.
- `listSpouses` controller is cut off in the current file. Finish it: `prisma.employeeSpouse.findMany({ where: { employeeMatricule: matricule } })`.

### 5.7 `parent.ts` — `addParent`

- `parentMatricule: "GENERATOR"` — same fix as spouse. Accept it on the schema (add to `parentSchema.ts`) and use it.

### 5.8 `credential.ts` — `getCredential`

- The response sends `getCredential` (the function reference) instead of `credential`. Fix.
- `deleteCredential` has an empty try block. Implement: `prisma.academicCredential.delete({ where: { id, employeeMatricule: matricule } })`.

### 5.9 `contact.ts` — `getContact`

- Validates the body with `emergencyContactSchema` on a GET request. Remove that block — GETs don't have a body.

---

## 6. New endpoints to implement (follow §3 conventions)

These controllers don't exist yet. Create one file per group under `source/modules/hr/`.

### 6.1 Employee contracts — `source/modules/hr/employees/employee-contract/contract.ts`

The schema already exists (`contractSchema.ts`). Build:

- `POST /:matricule/contracts` → `createContract` — validate body, insert with `employeeMatricule` from params.
- `GET /:matricule/contracts` → `listContracts` — `findMany({ where: { employeeMatricule } })`.
- `GET /:matricule/contracts/:contractId` → `getContract`.
- `PATCH /:matricule/contracts/:contractId` → `updateContract` — derive an `updateContractSchema` with `.omit({ contractId: true, employeeMatricule: true })`.
- `POST /:matricule/contracts/:contractId/terminate` → `terminateContract` — body `{ terminationDate, terminationReason }`, update those fields.

Wire these in `hrRouter.ts` below the positions section.

### 6.2 Top-level organizational modules — new module folders

Each is its own module folder under `source/modules/`, each with `<thing>.ts`, `<thing>Router.ts`, `<thing>Schema.ts`.

- `source/modules/companies/`
  - `POST /` `GET /` `GET /:id` `PATCH /:id` `DELETE /:id`
  - Mount in `app.ts` at `/api/v1/companies`.
- `source/modules/departments/`
  - `POST /` `GET /` `GET /:departmentId` `GET /:departmentId/children` `PATCH /:departmentId` `DELETE /:departmentId`
  - Mount at `/api/v1/departments`.
- `source/modules/positions/`
  - `POST /` `GET /` `GET /:id` `GET /:id/subordinates` `GET /:id/holders` `PATCH /:id` `DELETE /:id`
  - Plus nested position skills:
    - `GET /:id/skills` `POST /:id/skills` `PATCH /:id/skills/:skillId` `DELETE /:id/skills/:skillId`
  - Mount at `/api/v1/positions`.
  - When `PATCH` changes `supervisorId`, reject if superior is the same id (`supervisorId === id`). Cycle detection and cross-department checks are **out of scope for this slice** — add a `// TODO: cycle / cross-department check` comment and move on.
- `source/modules/skills/`
  - `POST /` `GET /` `GET /:id` `PATCH /:id` `DELETE /:id`
  - Mount at `/api/v1/skills`.
- `source/modules/contracts/` (top-level, read-only — writes go through the per-employee route)
  - `GET /` `GET /:contractId` `GET /expiring` (returns CDD/STAGE/TEMPORAIRE where `endDate` is within the next 60 days)
  - Mount at `/api/v1/contracts`.

For each new module, follow the exact shape of `source/modules/admin/users/` — router + controller + schema.

### 6.3 Auth module — complete it

- `authRouter.ts` — add `export default router`, and add routes:
  - `POST /login` → `loginEmployee` (already named `UserLogin` — rename to `loginEmployee`)
  - `POST /change-password` → `changePassword`
- `auth.ts` — finish:
  - `loginEmployee`: already mostly done; the `find a solution for users with no employee records` TODO is fine as-is for the first slice — current behaviour (fallback to `user.username`) is correct.
  - `changePassword`: validate body with `updatePasswordSchema`, read `userId` off `req.user` (see §7 for middleware), look up user, `verifyPassword` on `currentPassword`, `hashPassword` on `newPassword`, update.

### 6.4 Admin / Users — complete

- `userRouter.ts` — add `export default router` at the bottom.
- `user.ts` — add `deleteUser` handler (`DELETE /:userId`) and wire the route.

---

## 7. Auth middleware (one file)

Create `source/lib/auth.middleware.ts`:

```ts
import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt";

declare module "express-serve-static-core" {
    interface Request {
        user?: { userId: string; role: string };
    }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            res.status(401).json({message: "Missing or invalid Authorization header"})
            return
        }
        const token = header.slice(7)
        const payload = await verifyToken<{ userId: string; role: string }>(token)
        req.user = { userId: payload.userId, role: payload.role }
        next()
    } catch (error) {
        res.status(401).json({message: "Invalid or expired token"})
        console.log(error)
    }
}

export const requireRole = (allowed: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({message: "Not authenticated"})
            return
        }
        if (!allowed.includes(req.user.role)) {
            res.status(403).json({message: "Not authorized"})
            return
        }
        next()
    }
}
```

Apply `requireAuth` to all routers in `app.ts` **except** `/api/v1/auth/login` and `/api/v1/auth/refresh`:

```ts
app.use("/api/v1/auth", authRouter)                              // public endpoints inside
app.use("/api/v1/hr/employees", requireAuth, hrRouter)
app.use("/api/v1/admin/users", requireAuth, requireRole(["Admin", "HR"]), userRouter)
app.use("/api/v1/companies", requireAuth, companiesRouter)
// ...etc
```

The HR mutations (POST/PATCH/DELETE) get `requireRole(["HR"])` added at the specific route level inside `hrRouter.ts`. GETs stay open to any authenticated role. **Do not** scatter role checks throughout controllers — keep them in router-level middleware.

---

## 8. Unit tests — write these after the module compiles cleanly

Use **Bun's built-in test runner** (`bun test`). No Jest, no Vitest.

### 8.1 Setup

- Add `source/__tests__/` as the test folder.
- One test file per controller: `employee.test.ts`, `spouse.test.ts`, etc.
- Use `supertest` for HTTP-level tests. Add to `package.json`:
  ```
  bun add -d supertest @types/supertest
  ```
- Create `source/__tests__/helpers.ts` with:
  - `buildTestApp()` — returns the Express app wired up (same as `source/app.ts`)
  - `issueTestToken(userId, role)` — uses the same `signAccessToken` from `lib/jwt`
  - A `beforeEach` helper that truncates relevant tables using `prisma.$transaction([prisma.employeeSpouse.deleteMany(), ...])`

### 8.2 What to test per endpoint (keep simple)

For every endpoint: **happy path + one 400 + one 404** (+ one 409 where applicable, e.g. polygamy).

Example — `employee.test.ts`:

```ts
import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedEmployee } from "./helpers"

const app = buildTestApp()
let hrToken: string

beforeAll(async () => {
    hrToken = await issueTestToken("TEST-HR-001", "HR")
})

beforeEach(async () => {
    await resetDb()
})

describe("POST /api/v1/hr/employees", () => {
    test("201 creates an employee with user", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ /* valid body */ })
        expect(res.status).toBe(201)
        expect(res.body.employeeMatricule).toBeDefined()
    })

    test("400 on missing firstName", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ /* body with firstName missing */ })
        expect(res.status).toBe(400)
        expect(res.body.message).toBe("Bad Schema")
    })
})

describe("GET /api/v1/hr/employees/:matricule", () => {
    test("200 returns the employee", async () => { /* ... */ })
    test("404 for unknown matricule", async () => { /* ... */ })
})
```

### 8.3 Coverage target (not exhaustive — this is the first slice)

Write tests for (at minimum):

- `employee`: create, get-one, list, archive, restore, list-archived, get-archived
- `spouse`: add (incl. 409 polygamy), list, get, update, endMarriage
- `child`: add, list, get, update, delete
- `parent`: add, list, get, update, delete
- `contact`: add, list, get, update, delete
- `credential`: add, list, get, update, delete
- `employee-skill`: add, list, get, update, delete
- `employee-position`: add, list, get, update, endAssignment
- `employee-contract`: create, list, get, update, terminate
- `company`, `department`, `position`, `skill`, top-level `contract`: happy-path CRUD each

Skip exhaustive error-path tests — one 400 and one 404 per endpoint is enough for this slice.

### 8.4 Test DB

- Use a dedicated test schema. Doppler config `.env.test` or Doppler config `test` with its own `DATABASE_URL` pointing at a disposable Supabase branch (or a local Postgres).
- `resetDb()` deletes all rows between tests — in a safe order (children first, then parents). Do **not** drop tables.
- Add a test script to `package.json`:
  ```json
  "test": "doppler run --config test -- bun test"
  ```

---

## 9. What NOT to do

- Don't touch `prisma/schema.prisma` unless a compile fails. The schema is locked.
- Don't move files.
- Don't rename working functions.
- Don't add OpenAPI/Swagger generation now.
- Don't add pagination or filtering (small scale; frontend handles it).
- Don't add a global error handler or request logger.
- Don't introduce ESLint/Prettier configs now.
- Don't convert existing CommonJS patterns to ES modules — the repo is already ESM-ready.
- Don't replace `console.log(error)` with a proper logger — it's intentional for v1.

---

## 10. Order of work

Do this in order. Push a commit after each step.

1. Fix §5 bugs. Repo should compile cleanly and `bun run dev` should start.
2. Wire `app.ts` per §4 + add `export default router` to all three routers.
3. Implement the auth middleware (§7) and apply it in `app.ts`.
4. Complete the auth module (§6.3) and user module (§6.4).
5. Build the 5 new top-level modules (§6.2).
6. Build employee-contract (§6.1).
7. Add tests (§8). Run `bun test` — all green before you stop.

If any step takes you off the expected path (a Prisma migration surprises you, an enum is missing, something doesn't compile), stop and explain in a comment instead of guessing a fix.

---

## 11. Reference — endpoint inventory (from the Postman collection "Yousra RH")

All under `/api/v1/hr/employees` unless marked top-level.

**Employees**
- `GET /`, `GET /:matricule`, `POST /`, `PATCH /:matricule`
- `POST /:matricule/archive`, `POST /:matricule/restore`
- `GET /archived`, `GET /archived/:matricule`

**Spouses** `/:matricule/spouses`
- `GET /`, `GET /:spouseMatricule`, `POST /`, `PATCH /:spouseMatricule`, `POST /:spouseMatricule/end`

**Children** `/:matricule/children`
- `GET /`, `GET /:childMatricule`, `POST /`, `PATCH /:childMatricule`, `DELETE /:childMatricule`

**Parents** `/:matricule/parents`
- `GET /`, `GET /:parentMatricule`, `POST /`, `PATCH /:parentMatricule`, `DELETE /:parentMatricule`

**Emergency contacts** `/:matricule/emergency-contacts`
- `GET /`, `GET /:contactId`, `POST /`, `PATCH /:contactId`, `DELETE /:contactId`

**Academic credentials** `/:matricule/academic-credentials`
- `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`

**Employee skills** `/:matricule/skills`
- `GET /`, `GET /:skillId`, `POST /`, `PATCH /:skillId`, `DELETE /:skillId`

**Employee positions (assignments)** `/:matricule/positions`
- `GET /`, `GET /:assignmentId`, `POST /`, `PATCH /:assignmentId`, `POST /:assignmentId/end`

**Employee contracts** `/:matricule/contracts`
- `GET /`, `GET /:contractId`, `POST /`, `PATCH /:contractId`, `POST /:contractId/terminate`

**Top-level (separate mount points)**
- `/api/v1/companies` — `GET`, `POST`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
- `/api/v1/departments` — `GET`, `POST`, `GET /:departmentId`, `GET /:departmentId/children`, `PATCH /:departmentId`, `DELETE /:departmentId`
- `/api/v1/positions` — `GET`, `POST`, `GET /:id`, `GET /:id/subordinates`, `GET /:id/holders`, `PATCH /:id`, `DELETE /:id`; nested `/skills`: `GET`, `POST`, `PATCH /:skillId`, `DELETE /:skillId`
- `/api/v1/skills` — `GET`, `POST`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
- `/api/v1/contracts` — `GET`, `GET /:contractId`, `GET /expiring`

**Auth** `/api/v1/auth`
- `POST /login`, `POST /change-password` (add `/refresh` and `/logout` later — not in this slice)

**Admin / Users** `/api/v1/admin/users`
- `POST /`, `GET /`, `GET /:userId`, `PATCH /:userId`, `DELETE /:userId`

---

End of brief. Start with §5. Ask before straying.
