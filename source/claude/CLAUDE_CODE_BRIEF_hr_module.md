# Claude Code brief — finish the HR module (ERP-Yousra)

You are working in the `ERP-Yousra` repo. The HR module is partially coded; your job is to **finish it** and **write unit tests for it**. Follow the author's existing style — **mirror it exactly**. This is the single most important rule in this brief. If you have to choose between "idiomatic" and "same as the author's existing files", pick the author's style every time.

Keep code simple. Keep it readable. Add short, honest comments. Do not refactor files that already work. Do not introduce new patterns. Do not add libraries. Do not create abstractions.

---

## 0. The non-negotiables (read first, read twice)

These override everything else in this document. If a later section contradicts one of these, ignore the later section.

1. **Everything HR-owned lives in `source/modules/hr/`.** That includes: employees (and all their sub-resources), **top-level positions, the skill catalog, and top-level contracts**. Do NOT split these into siblings of `hr/` (no `source/modules/positions/`, no `source/modules/skills/`, no `source/modules/contracts/` — they belong inside `hr/`). **Companies and departments are their own single module** — `source/modules/company/` — mounted at `/api/v1/company`. Companies and departments are shared org structure (finance, stock, and inventory will mount the same module later), so they're NOT under `hr/`. One module, one mount point, same aggregator pattern as HR.

2. **Mirror the author's style exactly.** The style is defined by the existing files — especially `source/modules/hr/employees/employee.ts`, `source/modules/hr/employees/parents/parent.ts`, `source/modules/hr/employees/contacts/contact.ts`, and `source/modules/hr/employees/credentials/credential.ts`. If your instinct says "I would write this differently", suppress that instinct. Read §3 before writing a single line.

3. **Comments are not optional.** The author comments as he codes — short, casual, in his own voice. §3.6 is the full rule. Follow it everywhere.

4. **Simple over clever, always.** No array `.reduce` tricks. No Sets. No regex. No one-liners that need a moment to parse. If there's a straight loop that reads like English, write the loop.

5. **If a step takes you off the path** — a Prisma migration surprises you, an enum is missing, something won't compile cleanly — stop, write a short comment explaining what you saw, and ask. Do not improvise fixes to the schema or to libraries.

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

## 2. Folder layout — target state after your work

```
source/
  app.ts                         ← wires everything (currently a stub)
  server.ts                      ← fine as-is
  lib/
    prisma.ts
    password.ts
    jwt.ts
    auth.middleware.ts           ← NEW (you will create, §7)
  modules/
    auth/
      auth.ts                    ← finish (login, change-password)
      authRouter.ts              ← needs default export + routes
      authSchema.ts              ← fine as-is
    admin/
      users/
        user.ts                  ← add deleteUser
        userRouter.ts            ← needs default export + delete route
        userSchema.ts
    company/                     ← NEW (shared org, not HR)
      companyRouter.ts           ← aggregator: mounts /companies and /departments
      companies/
        company.ts
        companyRouter.ts         ← mounted at /companies by the aggregator
        companySchema.ts
      departments/
        department.ts
        departmentRouter.ts      ← mounted at /departments by the aggregator
        departmentSchema.ts
    hr/
      hrRouter.ts                ← aggregates all HR sub-routers (§4.2)
      employees/
        employeeRouter.ts        ← renamed from the current buggy hrRouter.ts
        employee.ts
        employee.schema.ts
        spouses/ ... employee-contract/ ← existing sub-folders stay
      positions/                 ← NEW (top-level Position catalog)
        position.ts
        positionRouter.ts
        positionSchema.ts
        position-skills/         ← nested: which skills a position requires
          positionSkill.ts
          positionSkillSchema.ts
      skills/                    ← NEW (top-level Skill catalog)
        skill.ts
        skillRouter.ts
        skillSchema.ts
      contracts/                 ← NEW (top-level contract reads only)
        contract.ts
        contractRouter.ts
        contractSchema.ts
  __tests__/                     ← NEW (§8)
    helpers.ts
    employee.test.ts
    spouse.test.ts
    ... (one per controller)
```

Three modules are built this round: **`auth`**, **`company`**, **`hr`**. Each has its own mount point and, where it has sub-resources, its own aggregator router — the same pattern throughout. Companies and departments stay out of `hr/` because they're shared org structure that other modules (finance, inventory, stock) will mount later.

---

## 3. Coding conventions — MIRROR these (section with the most weight)

Before you write anything new, open these files and read them fully:

- `source/modules/hr/employees/employee.ts`
- `source/modules/hr/employees/parents/parent.ts`
- `source/modules/hr/employees/contacts/contact.ts`
- `source/modules/hr/employees/credentials/credential.ts`
- `source/modules/admin/users/user.ts`
- `source/modules/hr/employees/spouses/spouse.schema.ts`

New code must look like it came from the same person who wrote those.

### 3.1 Controller shape — the one true template

Every handler looks like this:

```ts
// Short label of what this does
export const handlerName = async (req: Request, res: Response): Promise<void> => {
    try {
        // Read params
        const matricule: string = req.params.matricule as string

        if(!matricule) {
            res.status(400).json({message: "Invalid Parameters"})
            return
        }

        // Validate body (skip on GET)
        const result = someSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }
        const data = result.data

        // DB call
        const thing = await prisma.something.create({ data: { ...data } })

        res.status(200).json(thing)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
}
```

That's the shape. Keep whitespace quirky and matching: the existing files often have a space before `:` in object properties, use 4-space indent, and keep try/catch inline. **Do not reformat existing files to make them "cleaner".** Match them.

### 3.2 What NOT to introduce

- **No response envelope.** No `{ success, data, message }`. Handlers return the raw resource or an array. The error shape is `{ message, error? }`. That's it.
- **No central error handler / Express error middleware.** Each handler has its own try/catch with `console.log(error)` inside.
- **No `AppError` or custom error classes.**
- **No service layer.** The Prisma call lives in the controller file next to the HTTP code. One file per resource.
- **No `.service.ts` / `.repository.ts` / `.dto.ts` naming.** Files are named after what they hold: `employee.ts`, `spouse.ts`, `parent.ts`, `employee.schema.ts`.
- **No logger library.** `console.log(error)` in catch blocks. Intentional.
- **No middleware that wraps try/catch (`asyncHandler`).** The try/catch is written out every time, by hand, like in the existing files.
- **No request validation middleware library.** `safeParse` inline in the handler.
- **No regex.**
- **No `.reduce`, no `Set`.** `.map` and `.filter` are fine when they read clearly. Otherwise a plain `for` loop.
- **No type-wrapping libraries** (ts-pattern, io-ts, fp-ts, etc.).
- **No new runtime deps** beyond what's already in `package.json`. Test-only deps are OK (`supertest`).

### 3.3 Validation

- Always `import * as z from "zod"` (never `import { z }`).
- One schema file per resource, same folder as the controller.
- Create schema is the full one. Update schema derives via `.partial()` or `.omit({...})` — never re-declare.
- Enums come from Prisma's generated client:
  ```ts
  import { ContractType } from "../../../../../generated/prisma/enums";
  contractType: z.enum(ContractType)
  ```
- Dates: `z.coerce.date()`.
- Optional nullable fields: `z.string().nullable().optional()`.
- Phones: `z.e164()` (like `contactSchema.ts` already does).
- Error flattening: always `const fieldErrors = z.flattenError(result.error)` and respond with `{ message: "Bad Schema", error: fieldErrors.fieldErrors }`.

### 3.4 Prisma rules

- Multi-table writes go through `prisma.$transaction(async (tx) => { ... })`.
- **Always `await` the transaction** at the top level. The existing `createEmployee` and `addSpouse` are missing it — fix them (§5).
- Inside the transaction use `tx.something.create`, not `prisma.something.create`.
- Avoid putting network calls (bcrypt is fine, HTTP calls are not) inside the transaction callback — but `hashPassword` is already correctly computed before the transaction in `createEmployee`.
- For reads with related rows, use `include` or `select` — mirror the existing `findUnique({ include: { spouses: true } })` pattern.

### 3.5 Router style — mirror `employeeRouter.ts` (what `hrRouter.ts` becomes)

```ts
import { Router } from "express";
import { handlerA, handlerB } from "./some.controller";

const router = Router()

// Short label grouping the next lines
router.post("/" , handlerA)
router.get("/" , handlerB)

export default router    // ← ALWAYS export default
```

Notice the author's habits:
- `router.post("/" , handlerA)` — space before the comma (keep it).
- Section labels as comments: `// Spouse`, `// Children`, `// Parents`, etc.
- Inline end-of-line comments: `router.post("/:matricule/spouses", addSpouse) // Add spouse // check for polygamy`

Match these.

### 3.6 Comments — the author's distinctive style (very important)

The author comments as he writes. Comments are short, casual, in his own voice. They serve three purposes:

**(a) Section labels inside files or routers.** One-line, plain English.

```ts
// Employees
router.post("/" , createEmployee)
router.get("/" , getEmployees)

// Spouses
router.get("/:matricule/spouses", listSpouses)
```

**(b) Inside a function, labelling the step about to happen.** Imperative.

```ts
// Check if the employee already has an active spouse
const activeSpouseCount = employee.spouses.filter(s => s.isActive).length

// If monogamous, reject
if (employee.marriageRegime === "MONOGAMOUS" && activeSpouseCount >= 1) {
    res.status(409).json({message: "Employee is monogamous and already has a spouse"})
    return
}
```

**(c) Honest TODOs to future self.** Casual tone, no JIRA ticket references. These are important — the author actively uses them to track things. Keep the voice.

Examples pulled from existing code, which you should emulate:

```ts
// We need to build dynamic Queries here later
// find a solution for users with no employee records
// Maybe we should only end marriage of employees that are not archived
// Not supposed to be there
// change later
// ALLOW THE API TO BE ACCESSED BY BOTH HR AND EMPLOYEE
// You need to fix these API with/employee
```

Rules for comments:

- **No JSDoc.** No `/** @param ... @returns ... */`. Ever.
- **No Doxygen.** No `@file`, `@brief`, etc.
- **No commented-out code** left in finished files. The author sometimes leaves scratch (`DummyFunction` at the bottom of `spouse.ts` is intentional) — leave that alone, but do not add new commented-out blocks.
- **No "AI slop" comments.** Avoid obvious ones like `// Create a new user` above `prisma.user.create` — the code already says that. Comment the *reason*, the *gotcha*, the *TODO*, not the code itself.
- **Short.** Most comments are under 10 words.
- **Lowercase after `//`.** The author often writes lowercase; follow him.
- **Keep his casual register.** If he would write `// change later`, write `// change later`. Don't over-formalize to `// Pending implementation — track in backlog`.
- **Use TODO-style notes freely.** They're how he thinks. If you're punting on something, write one. If you spot something that the current slice doesn't cover, write one.
- **No CEO-facing tone.** This is internal code for him and Franck. Dry humour is fine (there's already `// Untill Franck learns to use Refresh Tokens` in `lib/jwt.ts`).

When in doubt: ask yourself "would the author have written this comment?" If no, delete it.

### 3.7 Status codes (match existing handlers)

- 200 for GET and PATCH success.
- 201 for POST create success.
- 400 for bad params / bad schema.
- 404 when a lookup returns `null`.
- 409 for business rule conflicts (polygamy, etc.).
- 500 for any `catch`.
- 204 is not used. Always return the resource (or at minimum a `{message: "..."}`).

---

## 4. Wiring the app

### 4.1 `source/app.ts`

Replace the stub with:

```ts
import express from "express"
import hrRouter from "./modules/hr/hrRouter"
import authRouter from "./modules/auth/authRouter"
import userRouter from "./modules/admin/users/userRouter"
import companyRouter from "./modules/company/companyRouter"
import { requireAuth, requireRole } from "./lib/auth.middleware"

const app = express()

app.use(express.json())

// Public
app.use("/api/v1/auth", authRouter)

// Protected
app.use("/api/v1/hr", requireAuth, hrRouter)
app.use("/api/v1/admin/users", requireAuth, requireRole(["Admin", "HR"]), userRouter)

// Shared org structure — not HR
app.use("/api/v1/company", requireAuth, companyRouter)

// Health
app.get("/", (req, res) => {
    res.send("Yousra ERP API")
})

export default app
```

### 4.2 `source/modules/hr/hrRouter.ts` — the aggregator

The current `hrRouter.ts` holds all the employee-related routes and has bugs (§5). **Rename** that file to `source/modules/hr/employees/employeeRouter.ts` and **create a new** `source/modules/hr/hrRouter.ts` that aggregates:

```ts
import { Router } from "express";
import employeeRouter from "./employees/employeeRouter";
import positionRouter from "./positions/positionRouter";
import skillRouter from "./skills/skillRouter";
import contractRouter from "./contracts/contractRouter";

const router = Router()

// Sub-routers — each lives in its own folder under source/modules/hr/
router.use("/employees", employeeRouter)
router.use("/positions", positionRouter)
router.use("/skills", skillRouter)
router.use("/contracts", contractRouter)

export default router
```

That way **every HR-owned route lives under `/api/v1/hr/*`** and every HR-owned file lives under `source/modules/hr/`.

### 4.3 `source/modules/company/companyRouter.ts` — the aggregator for the company module

Same pattern as `hrRouter.ts`. Combines companies + departments under one mount point:

```ts
import { Router } from "express";
import companiesRouter from "./companies/companyRouter";
import departmentsRouter from "./departments/departmentRouter";

const router = Router()

// Sub-routers — each lives in its own folder under source/modules/company/
router.use("/companies", companiesRouter)
router.use("/departments", departmentsRouter)

export default router
```

Mount point from `app.ts`: `/api/v1/company`. So companies CRUD sits at `/api/v1/company/companies/*` and departments at `/api/v1/company/departments/*`.

> Naming note — the inner file is `companies/companyRouter.ts` (singular "company" like the Prisma model). Don't rename it to `companiesRouter.ts`. Same for `departments/departmentRouter.ts`.

---

## 5. Bugs in existing HR files — fix these FIRST

Before adding anything new. One commit per group.

### 5.1 `source/modules/hr/employees/employeeRouter.ts` (currently `hrRouter.ts`)

- Rename the file to `source/modules/hr/employees/employeeRouter.ts`. Update the import in the new `hrRouter.ts` accordingly.
- Strip the `/employees` prefix from every route (since the aggregator now mounts this router under `/employees`):
  - `router.get("/employees/:matricule/skills", getSkills)` → `router.get("/:matricule/skills", getSkills)`
  - Same for every `/employees/...` line in the file.
- Fix broken paths:
  - `router.get("/matricule", getAnEmployee)` → `router.get("/:matricule", getAnEmployee)` (missing colon)
  - `router.get("/:matricule/:childMatricule", getAChild)` → `router.get("/:matricule/children/:childMatricule", getAChild)` (missing `/children`)
  - Same insert for `PATCH` and `DELETE` on children
  - `router.get("/employees/:matricule/position/:assignmentId", getPosition)` → `router.get("/:matricule/positions/:assignmentId", getPosition)` (plural + prefix)
- Fix swapped handlers on academic credentials:
  - `router.get("/:matricule/academic-credentials", addCredential)` → should call `getCredentials`
  - `router.post("/:matricule/academic-credentials", getCredentials)` → should call `addCredential`
- Rename `DeleteChildren` → `deleteChild` (singular, lower-camel) in both the controller and the router.
- Add `export default router` at the bottom (currently missing).
- Keep the `// Spouse`, `// Children`, `// Parents`, etc. section comments — they're the author's style.

### 5.2 `employee.ts` — `createEmployee`

**Important design change — user creation comes OUT of this handler.** User accounts and employee records are independent (that's the design: a user can exist without an employee, and HR links them later with the new endpoint in §6.9). So:

- **Remove the `tx.user.create` call entirely from the transaction.** No user is created here. `createEmployee` creates only the employee row.
- Because only one table is written, you can drop `prisma.$transaction` and use `prisma.employee.create` directly. Simpler, same result.
- Remove the `"SOONTOBEADDED"` placeholder for `employeeMatricule`. The schema validates `employeeMatricule`, so use `data.employeeMatricule` directly.
- Remove `email`, `password`, and `role` from `employeeSchema` if they're there — they belong on `userSchema` now. Keep only what lives on `Employee`.
- Return the created employee with status 201.
- Short comment at the top: `// Employee has no user attached yet — HR links one via /link-user`.
- Leave the `// We need to build dynamic Queries here later` comment in `getEmployees` as-is — that's the author's style of TODO-marker.

### 5.3 `employee.ts` — `archiveEmployee`, `restoreEmployee`, `listArchivedEmployees`

- `archiveEmployee` is cut off mid-function (`const result = archiveEmployeeSchem`). Finish it: validate body, then `prisma.employee.update({ where: { employeeMatricule: matricule }, data: { isArchived: true, departureDate: data.effectiveDate } })`. Add a comment: `// We keep the record; just flag it archived`.
- `restoreEmployee` — implement: `isArchived: false`, `departureDate: null`. Comment: `// Reversing archive; contracts and assignments stay as they were`.
- `listArchivedEmployees` — implement: `findMany({ where: { isArchived: true } })`.

### 5.4 `spouses/spouse.ts` — `addSpouse`

- The polygamy check reads `employee.spouses` as a boolean but it's an array. Rewrite:
  ```ts
  // Check if the employee already has an active spouse
  const activeSpouseCount = employee.spouses.filter(s => s.isActive).length

  // Monogamous employees can only have one active spouse at a time
  if (employee.marriageRegime === "MONOGAMOUS" && activeSpouseCount >= 1) {
      res.status(409).json({message: "Employee is monogamous and already has a spouse"})
      return
  }
  ```
- The transaction is assigned to `createMarriage` but never awaited — add `await`.
- Replace `spouseMatricule: "DEFAULT"` with `data.spouseMatricule` (the caller passes it in the body — same convention the author used for `employeeMatricule`). Make sure `spouseMatricule` is in the schema. Comment: `// caller supplies the matricule for now — we'll auto-generate later`.
- Return the created spouse (and the marital status update in a single response if that reads cleanly).

### 5.5 `spouses/spouse.ts` — `endMarriage`, `getSpouse`, `listSpouses`

- `endMarriage` and `getSpouse` both read `spouseMatricule: string = req.params.matricule as string` — that second read must be `req.params.spouseMatricule`.
- `endMarriage` — the update's `where` should include both `spouseMatricule` and `employeeMatricule` so the spouse must belong to the right employee.
- `listSpouses` is cut off — finish it: `prisma.employeeSpouse.findMany({ where: { employeeMatricule: matricule } })`.

### 5.6 `parents/parent.ts` — `addParent`

- `parentMatricule: "GENERATOR"` — replace with `data.parentMatricule`. Add `parentMatricule` to `parentSchema.ts` with a comment: `// caller supplies it for now`.

### 5.7 `credentials/credential.ts`

- `getCredential` sends `getCredential` (the function reference!) instead of the fetched row. Fix.
- `deleteCredential` has an empty try block — implement.

### 5.8 `contacts/contact.ts` — `getContact`

- `getContact` runs `safeParse` on `req.body` for a GET. Remove that block — GETs don't have a body.

---

## 6. New controllers to add — all inside `source/modules/hr/`

Create one folder per resource, each with three files: `<thing>.ts`, `<thing>Router.ts`, `<thing>Schema.ts`. Mirror `source/modules/hr/employees/parents/` for the shape.

### 6.1 `source/modules/hr/employees/employee-contract/` — per-employee contracts

Schema already exists. Add `contract.ts` and `contractRouter.ts`:

- `POST /:matricule/contracts` → `createContract`
- `GET /:matricule/contracts` → `listContracts`
- `GET /:matricule/contracts/:contractId` → `getContract`
- `PATCH /:matricule/contracts/:contractId` → `updateContract`
- `POST /:matricule/contracts/:contractId/terminate` → `terminateContract` (body: `{ terminationDate, terminationReason }`)

Wire these in `employeeRouter.ts` under a `// Contracts` section comment.

### 6.2 The `company` module — companies + departments together

Lives in `source/modules/company/` (see §2 and §4.3). One aggregator router, two sub-folders. Mount point from `app.ts` is `/api/v1/company`.

#### 6.2.a `source/modules/company/companies/`

- `POST /` `createCompany`
- `GET /` `listCompanies`
- `GET /:id` `getCompany`
- `PATCH /:id` `updateCompany`
- `DELETE /:id` `deleteCompany`

Final URLs: `/api/v1/company/companies/*`.

#### 6.2.b `source/modules/company/departments/`

- `POST /` `createDepartment`
- `GET /` `listDepartments`
- `GET /:departmentId` `getDepartment`
- `GET /:departmentId/children` `listChildDepartments` — direct children only
- `PATCH /:departmentId` `updateDepartment`
- `DELETE /:departmentId` `deleteDepartment`

Final URLs: `/api/v1/company/departments/*`.

HR owns the data (role-gated write access, see §7) but the module itself is separate so finance, stock, and inventory can mount the same routers later without pulling in `hr/`.

### 6.4 `source/modules/hr/positions/` (top-level Position catalog)

- `POST /` `createPosition`
- `GET /` `listPositions`
- `GET /:id` `getPosition`
- `GET /:id/subordinates` `listSubordinates`
- `GET /:id/holders` `listHolders` — employees currently holding this position (active `employeePositions`)
- `PATCH /:id` `updatePosition`
- `DELETE /:id` `deletePosition`

On `updatePosition`, if `supervisorId` changes: reject with 400 when `supervisorId === id`. Cross-service / cycle detection is **out of scope** for this slice — write `// TODO: cycle and cross-service check later` and move on.

Plus **nested** `source/modules/hr/positions/position-skills/`:
- `GET /:id/skills` `listPositionSkills`
- `POST /:id/skills` `addPositionSkill`
- `PATCH /:id/skills/:skillId` `updatePositionSkill`
- `DELETE /:id/skills/:skillId` `removePositionSkill`

### 6.5 `source/modules/hr/skills/` (top-level Skill catalog)

- `POST /` `createSkill`
- `GET /` `listSkills`
- `GET /:id` `getSkill`
- `PATCH /:id` `updateSkill`
- `DELETE /:id` `deleteSkill`

### 6.6 `source/modules/hr/contracts/` (top-level, read-only)

Writes go through the per-employee route in §6.1. Here we only expose cross-employee reads:

- `GET /` `listAllContracts`
- `GET /:contractId` `getContractById`
- `GET /expiring` `listExpiringContracts` — CDD / STAGE / TEMPORAIRE where `endDate` is within the next 60 days

### 6.7 Auth module — complete it

- `source/modules/auth/authRouter.ts` — missing `export default router`. Add it, plus:
  - `POST /login` → the existing `UserLogin` (rename to `loginEmployee` to match the public-facing name)
  - `POST /change-password` → `changePassword`
- `source/modules/auth/auth.ts` — finish `changePassword`:
  - Validate with `updatePasswordSchema`.
  - Read `userId` from `req.user` (set by middleware §7).
  - Look up user, `verifyPassword(currentPassword, user.password)`, `hashPassword(newPassword)`, update.
  - Leave the existing `// find a solution for users with no employee records` comment in `UserLogin` as-is. It's a real TODO.
- **Do not** add `/refresh` or `/logout` yet. Not part of this slice.

### 6.8 Admin / Users — complete it

- `source/modules/admin/users/userRouter.ts` — missing `export default router`. Add it.
- Add `deleteUser` handler to `user.ts` and wire `DELETE /:userId`.

### 6.9 Link a user account to an employee record — the missing piece

Design recap: a `User` can exist without an `Employee` (e.g., early admin accounts). An `Employee` is created without a `User` (§5.2 change). HR then **links** them when the person is ready to log in. That link endpoint is what's missing.

Lives in HR because HR owns the link action. Add to `source/modules/hr/employees/employee.ts`:

```ts
// HR links an existing user account to an employee record
export const linkUserToEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
        const matricule: string = req.params.matricule as string

        if(!matricule) {
            res.status(400).json({message: "Invalid Parameters"})
            return
        }

        const result = linkUserToEmployeeSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }
        const data = result.data

        // Employee must exist
        const employee = await prisma.employee.findUnique({ where: { employeeMatricule: matricule } })
        if(!employee) {
            res.status(404).json({message: "Employee not found"})
            return
        }

        // and must not already be linked
        if(employee.userId) {
            res.status(409).json({message: "Employee already linked to a user"})
            return
        }

        // User must exist
        const user = await prisma.user.findUnique({ where: { Id: data.userId } })
        if(!user) {
            res.status(404).json({message: "User not found"})
            return
        }

        // and must not already be linked to another employee
        const existingLink = await prisma.employee.findUnique({ where: { userId: data.userId } })
        if(existingLink) {
            res.status(409).json({message: "User is already linked to another employee"})
            return
        }

        const updated = await prisma.employee.update({
            where: { employeeMatricule: matricule },
            data: { userId: data.userId }
        })

        res.status(200).json(updated)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
}
```

Reuse `linkUserToEmployeeSchema` — it's already defined in `source/modules/auth/authSchema.ts`. Import from there.

Route — add in `employeeRouter.ts` in a new `// Link user` section:

```ts
// Link user
router.post("/:matricule/link-user", linkUserToEmployee)
```

Final URL: `POST /api/v1/hr/employees/:matricule/link-user` with body `{ userId: "<user uuid>" }`.

**Unlink** (optional, nice to have): `DELETE /:matricule/link-user` sets `userId` back to `null`. Comment: `// Unlink when the person leaves but their user account stays`. Skip it for this slice if time is tight.

---

## 7. Auth middleware — `source/lib/auth.middleware.ts`

One file. Keep it minimal, keep it matching the author's style (lowercase names, inline try/catch, `console.log(error)`).

```ts
import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt";

// Augment Express Request so TS knows req.user
declare module "express-serve-static-core" {
    interface Request {
        user?: { userId: string; role: string };
    }
}

// Require a valid Bearer token; attach req.user
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const header = req.headers.authorization

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

// Restrict a route to specific roles — use after requireAuth
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

Apply role-gates at the **router** level inside each sub-router, not inside controllers. Example in `companyRouter.ts` (path: `source/modules/company/companies/companyRouter.ts`):

```ts
import { Router } from "express";
import { requireRole } from "../../../lib/auth.middleware";
import { createCompany, listCompanies, getCompany, updateCompany, deleteCompany } from "./company";

const router = Router()

// Reads — anyone authenticated
router.get("/", listCompanies)
router.get("/:id", getCompany)

// Writes — HR only (HR owns the data even though it isn't under hr/)
router.post("/", requireRole(["HR"]), createCompany)
router.patch("/:id", requireRole(["HR"]), updateCompany)
router.delete("/:id", requireRole(["HR"]), deleteCompany)

export default router
```

---

## 8. Unit tests — write after the module compiles cleanly

Use **Bun's built-in test runner** (`bun test`). Not Jest. Not Vitest.

### 8.1 Setup

- Folder: `source/__tests__/`.
- One test file per controller, named `<thing>.test.ts`.
- Add `supertest` + its types:
  ```
  bun add -d supertest @types/supertest
  ```
- Create `source/__tests__/helpers.ts`:
  - `buildTestApp()` → returns the Express app (same wiring as `source/app.ts`)
  - `issueTestToken(userId, role)` → uses `signAccessToken` from `lib/jwt`
  - `resetDb()` → delete-all across HR tables, in FK-safe order. Do NOT drop tables.
  - `seedEmployee()`, `seedCompany()`, etc. → small helpers that insert valid rows and return them

### 8.2 The test shape to use (match this)

```ts
import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
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
    test("201 creates an employee + user", async () => {
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
            .send({ /* body missing firstName */ })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe("Bad Schema")
    })
})
```

### 8.3 Coverage — first slice

For each controller, at minimum:

- One **happy path** test
- One **400 validation** test
- One **404 not-found** test (where applicable)
- One **409 conflict** test only where applicable (polygamy on `addSpouse`, duplicate matricule on `createEmployee`)

That's enough. Don't go for exhaustive matrix coverage — this is a smoke-test suite.

Controllers to cover:

- `employee` (create, getOne, list, archive, restore, listArchived, getArchived, update)
- `spouse` (add, list, get, update, endMarriage) — include the 409 polygamy case
- `child`, `parent`, `contact`, `credential` (add, list, get, update, delete)
- `employee-skill` (add, list, get, update, delete)
- `employee-position` (add, list, get, update, endAssignment)
- `employee-contract` (create, list, get, update, terminate)
- `company`, `department`, `position`, `skill` (CRUD each)
- `contract` top-level (list, getById, expiring)
- `auth` (login happy path + wrong password)
- `user` (create, get, update, delete)

### 8.4 Test DB

- Doppler config `test` with its own `DATABASE_URL` → a disposable Supabase branch or a local Postgres.
- `package.json` script:
  ```json
  "test": "doppler run --config test -- bun test"
  ```

### 8.5 Comment the tests too

Short section comments inside each test file in the author's style:

```ts
// Happy path — HR creates a new hire
test("201 creates an employee + user", async () => { /* ... */ })

// Validation failure
test("400 on missing firstName", async () => { /* ... */ })
```

---

## 9. Do-not list (reminder)

- Don't modify `prisma/schema.prisma` unless something won't compile. The schema is locked.
- Don't move existing files to new locations beyond the one rename in §5.1.
- Don't rename working functions (only the ones §5 explicitly says to rename).
- Don't add OpenAPI/Swagger generation now.
- Don't add pagination or filtering (frontend handles it).
- Don't add a global error handler or request logger.
- Don't introduce ESLint/Prettier configs now.
- Don't introduce DTO classes, zod-to-ts helpers, or type-wrapping libraries.
- Don't convert `console.log(error)` to a proper logger — it's intentional.
- Don't put HR-owned data (positions, skills, contracts, employees) anywhere but `source/modules/hr/`. No `source/modules/positions/`, no `source/modules/skills/`, no `source/modules/contracts/`.
- Don't put companies or departments under `hr/`. They live together inside their own `source/modules/company/` module with its own aggregator router.
- Don't let `createEmployee` create a user. User and employee are separate; HR links them with the `link-user` endpoint (§6.9).

---

## 10. Order of work — one commit per step

1. Fix §5 bugs. `bun run dev` should start cleanly.
2. Wire `source/app.ts` + add `export default router` to every router + rename `hrRouter.ts` → `employeeRouter.ts` + create the new aggregator `hrRouter.ts` (§4).
3. Create the auth middleware (§7).
4. Finish the auth module and admin/users module (§6.7, §6.8).
5. Build the new modules — one commit each: the `company/` module with its aggregator + `companies/` + `departments/` (§6.2), then the HR sub-modules `hr/employees/employee-contract/`, `hr/positions/`, `hr/skills/`, `hr/contracts/` (§6.1, §6.4–§6.6), then the `link-user` endpoint in HR (§6.9).
6. Add tests (§8). `bun test` → all green. Only then stop.

Between commits, run `bun run dev` and manually POST through Postman (collection: "Yousra RH") to confirm nothing is broken.

---

## 11. Endpoint inventory (what Postman documents)

All under `/api/v1/hr/*`.

**Employees** — mounted at `/employees` by `hrRouter.ts` → `employeeRouter.ts`
- `GET /`, `GET /:matricule`, `POST /`, `PATCH /:matricule`
- `POST /:matricule/archive`, `POST /:matricule/restore`
- `GET /archived`, `GET /archived/:matricule`
- `POST /:matricule/link-user` (§6.9)

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

**Companies (shared org module)** — `/api/v1/company/companies`
- `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`

**Departments (shared org module)** — `/api/v1/company/departments`
- `GET /`, `POST /`, `GET /:departmentId`, `GET /:departmentId/children`, `PATCH /:departmentId`, `DELETE /:departmentId`

**Positions (top-level)** — `/api/v1/hr/positions`
- `GET /`, `POST /`, `GET /:id`, `GET /:id/subordinates`, `GET /:id/holders`, `PATCH /:id`, `DELETE /:id`
- Nested position-skills: `GET /:id/skills`, `POST /:id/skills`, `PATCH /:id/skills/:skillId`, `DELETE /:id/skills/:skillId`

**Skills (catalog)** — `/api/v1/hr/skills`
- `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`

**Contracts (top-level reads)** — `/api/v1/hr/contracts`
- `GET /`, `GET /:contractId`, `GET /expiring`

**Auth** — `/api/v1/auth`
- `POST /login`, `POST /change-password`

**Admin / Users** — `/api/v1/admin/users`
- `POST /`, `GET /`, `GET /:userId`, `PATCH /:userId`, `DELETE /:userId`

---

## 12. One-sentence reminders to tape above your desk

- Everything HR-owned (employees, positions, skills, contracts) lives in `source/modules/hr/`. Companies and departments live together in their own `source/modules/company/` module, mounted at `/api/v1/company`.
- User ≠ Employee. HR links them with `POST /api/v1/hr/employees/:matricule/link-user`.
- Mirror the existing files. If your fingers want to deviate, read `employee.ts` again.
- Comment like the author comments. Short, casual, in his voice. TODOs allowed.
- Simple over clever, always.
- When unsure, stop and ask. Don't guess.

End of brief. Start with §5.