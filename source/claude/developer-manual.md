# Developer manual

This manual helps you find your way around the code when you work on it by hand. It covers the HR, auth, company and admin/users modules as they stand on 2026-11-18. For what is still open, see `session-notes.md`.

---

## 1. How a request travels

```
server.ts → app.ts → module router (hrRouter / companyRouter / ...) → sub-router → handler → prisma
```

1. [app.ts](../app.ts) decides the URL prefix and runs `requireAuth` for every protected module.
2. The module router (for example [hr/hrRouter.ts](../modules/hr/hrRouter.ts)) only forwards the request to its sub-routers.
3. The sub-router (for example [employeeRouter.ts](../modules/hr/employees/employeeRouter.ts)) lists the routes. It adds `requireRole(["HR"])` on writes.
4. The handler validates the body with its Zod schema, talks to Prisma and sends the response.

There are no services and no central error handler. Each handler has its own try/catch.

---

## 2. Where things live

```
source/
├── app.ts                      mounts every module
├── server.ts                   starts the server
├── lib/
│   ├── auth.middleware.ts      requireAuth, requireRole, the req.user type
│   ├── jwt.ts                  sign / verify tokens (needs JWT_SECRET)
│   ├── password.ts             hashPassword, verifyPassword
│   └── prisma.ts               the prisma client
├── modules/
│   ├── auth/                   login, change-password
│   ├── admin/users/            user accounts (Admin and HR)
│   ├── company/                companies + departments (shared by every future module)
│   └── hr/
│       ├── hrRouter.ts         groups the 4 HR sub-routers
│       ├── employees/          employee + everything that belongs to one employee
│       │   ├── matricule.ts    builds every matricule / record id
│       │   ├── spouses/  children/  parents/  contacts/  credentials/
│       │   ├── employee-skills/  employee-positions/  employee-contract/
│       ├── positions/          job positions (+ position-skills/)
│       ├── skills/             the skill catalog
│       └── contracts/          read-only views across all employees
└── __tests__/                  one test file per resource + helpers.ts
```

**Naming in each folder:**
- `thing.ts` holds the handlers.
- `thingSchema.ts` (or `thing.schema.ts`) holds the Zod schemas.
- `thingRouter.ts` holds the routes, when the folder has its own router.

**Employee sub-resources** (spouses, children and so on) have no router of their own. Their routes are all in `employeeRouter.ts`, grouped under comments such as `// Spouse` and `// Children`.

---

## 3. URL map

| Prefix | Who can call it | Router |
|---|---|---|
| `/api/v1/auth` | anyone | [authRouter.ts](../modules/auth/authRouter.ts) |
| `/api/v1/admin/users` | Admin, HR | [userRouter.ts](../modules/admin/users/userRouter.ts) |
| `/api/v1/hr/employees` | logged in | [employeeRouter.ts](../modules/hr/employees/employeeRouter.ts) |
| `/api/v1/hr/positions` | logged in | [positionRouter.ts](../modules/hr/positions/positionRouter.ts) |
| `/api/v1/hr/skills` | logged in | [skillRouter.ts](../modules/hr/skills/skillRouter.ts) |
| `/api/v1/hr/contracts` | logged in | [contractRouter.ts](../modules/hr/contracts/contractRouter.ts) |
| `/api/v1/company/companies` | logged in | [companies/companyRouter.ts](../modules/company/companies/companyRouter.ts) |
| `/api/v1/company/departments` | logged in | [departmentRouter.ts](../modules/company/departments/departmentRouter.ts) |

**Access rule everywhere:** GET is open to any logged-in user. POST, PATCH and DELETE need `requireRole(["HR"])`, placed on the route itself.

Routes under `/api/v1/hr/employees/:matricule/...`:

| Path | What |
|---|---|
| `/`, `/:matricule` | employee CRUD |
| `/:matricule/archive`, `/:matricule/restore`, `/archived`, `/archived/:matricule` | archive |
| `/:matricule/link-user` (POST, DELETE) | attach or detach a login account |
| `/:matricule/spouses` | spouses (`/:spouseMatricule/end` ends a marriage) |
| `/:matricule/children` | children |
| `/:matricule/parents` | parents |
| `/:matricule/emergency-contacts` | emergency contacts |
| `/:matricule/academic-credentials` | diplomas |
| `/:matricule/skills` | the employee's skills |
| `/:matricule/positions` | position assignments (`/:assignmentId/end`) |
| `/:matricule/contracts` | contracts (`/:contractId/terminate`) |

**Route order matters.** A fixed path must sit above a `:param` path, or Express reads the fixed word as a param:
- `/archived` must stay above `/:matricule`.
- `/expiring` must stay above `/:contractId`.

---

## 4. Users vs employees

- A **User** is a login account (username, password, role). An **Employee** is an HR record. They are separate tables.
- Creating an employee does **not** create a user.
- HR links the two with `POST /api/v1/hr/employees/:matricule/link-user` and body `{ "userId": "<uuid>" }`, and unlinks with `DELETE` on the same URL.
- A user can be linked to only one employee, and an employee to only one user. Both cases return 409.
- **Deleting a linked user is refused** (409). Unlink first, then delete.
- User endpoints never return the password. Every query uses `omit: { password: true }`. Keep that on any new user query.

**Tokens** (`req.user = { userId, role }`):
- `userId` is the employee matricule if the user is linked, and the username otherwise. See `loginEmployee` in [auth.ts](../modules/auth/auth.ts).
- `changePassword` resolves it in the same order.

---

## 5. Matricules and record ids

All of this lives in [matricule.ts](../modules/hr/employees/matricule.ts).

**Employee:** `EMP-<hire year>-<hire month>-<number>`, for example `EMP-2024-08-001`.
- The year and month come from `hireDate`, which is why `hireDate` is required.
- The number is the number on the most recently *created* employee, plus 1. It does not follow the hire date. HR should register existing staff in hire-date order.
- Function: `generateEmployeeMatricule(hireDate)`.

**Records that belong to an employee:** the employee matricule, then a letter and a number.

| Record | Letter | Example |
|---|---|---|
| Spouse | S | `EMP-2024-08-001-S1` |
| Child | C | `EMP-2024-08-001-C1` |
| Parent | P | `EMP-2024-08-001-P1` |
| Emergency contact | EC | `EMP-2024-08-001-EC1` |
| Academic credential | AC | `EMP-2024-08-001-AC1` |
| Contract | CT | `EMP-2024-08-001-CT1` |

- Each employee and each kind of record has its own count. The next id is the highest existing number plus 1.
- If the highest record is deleted, its number comes back. This is accepted.
- Function: `nextRecordId(employeeMatricule, letter, existingIds)`.
- Position assignments, skills, positions, companies and departments still use database uuids.
- Clients **never** send these ids. They are not in the create schemas. `employeeMatricule` still comes in some request bodies, on purpose.

**To give a new kind of record a derived id**, copy what `addChild` in [child.ts](../modules/hr/employees/children/child.ts) does:

```ts
const existing = await prisma.employeeChild.findMany({
    where: { employeeMatricule : matricule },
    select: { childMatricule : true }
})
const childMatricule = nextRecordId(matricule, "C", existing.map(c => c.childMatricule))
```

Pick a new letter and add it to the comment list at the top of `nextRecordId`.

---

## 6. Employee rules worth remembering

- **Archive** only sets `isArchived: true` and `departureDate`. Contracts and assignments are not touched. Normal list and get routes hide archived employees; `/archived` shows them.
- **PATCH is partial.** Send only what changes. The matricule can't change. If a client sends one, Zod strips it. `niuNumber` and `cnpsNumber` also can't be changed through PATCH.
- **`MarriageRegime` vs `marriageRegime`:** the request field has a capital M, but the database column is lowercase. `createEmployee` and `updateEmployee` map it by hand. Don't spread `data` straight into Prisma for employees, or Prisma throws.
- **Polygamy check:** `addSpouse` returns 409 when a MONOGAMOUS employee already has an active spouse. Adding a spouse also sets the employee to MARRIED.

---

## 7. Writing a new handler (house style)

```ts
export const doSomething = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule : string = req.params.matricule as string

        if(!matricule) {
            res.status(400).json({message: "Invalid Parameters"})
            return
        }

        const result = someSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data
        // ...prisma call
        res.status(201).json(created)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};
```

- Return plain objects or arrays, with no `{ data: ... }` wrapper.
- Use 201 for create, 404 when the record isn't found, 409 for a conflict, 400 for bad input.
- Express types must use `import type { Request, Response } from "express"`, because `verbatimModuleSyntax` is on.
- Comments are short and lowercase, like the rest of the code.
- Not used in this codebase: services, a central error handler, regex, reduce/Set, new packages.
- Don't edit `prisma/schema.prisma` without deciding it on purpose.

**Adding a route:** put it in the matching router under the right `// Section` comment. Add `requireRole(["HR"])` if it writes.

---

## 8. Tests

- Run them with `bun run test`. This uses the Doppler **dev** config, which is the local Supabase on your laptop.
- **Every test wipes the whole database** (`resetDb()`). Never point the tests at stg or prd.
- The `dev` config must contain `JWT_SECRET`. Without it, every test fails with "Zero-length key is not supported".
- There is one file per resource in `source/__tests__/`. [helpers.ts](../__tests__/helpers.ts) gives you:
  - `buildTestApp()` and `issueTestToken(userId, role)`.
  - Seeders: `seedEmployee`, `seedSpouse`, `seedUser`, `seedSkill`, `seedCompany` and `seedOrgStructure`.
- Seeders write straight to Prisma, so you can give them any matricule, for example `seedEmployee("EMP-001")`.
- When you add a table, add it to `resetDb()` in the right order: children before parents, because of foreign keys.
- Type-check without running anything: `bunx tsc --noEmit`.

---

## 9. Quick "where do I change…"

| I want to… | Go to |
|---|---|
| change the matricule format | `hr/employees/matricule.ts` |
| change who can call a route | the route line in its router (`requireRole`) or `app.ts` |
| change what a token contains | `modules/auth/auth.ts` → `loginEmployee` |
| change token lifetime / signing | `lib/jwt.ts` |
| add a field to employee create/update | `hr/employees/employee.schema.ts` + `createEmployee` data block |
| change the expiring-contracts window (60 days) | `hr/contracts/contract.ts` → `listExpiringContracts` |
| add a new module (finance, stock…) | new folder in `modules/`, mount it in `app.ts`; reuse `company/` for org data |
