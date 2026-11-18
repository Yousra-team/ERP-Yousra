# Session notes (Claude)

Read this, `instructions.md` and `CLAUDE_CODE_BRIEF_hr_module.md` before starting work.

## State as of 2026-11-18

All 6 steps of the brief are coded. Type-check passes, and all 125 tests pass.

| Mount | Router |
|---|---|
| `/api/v1/auth` (public) | `modules/auth/authRouter.ts` |
| `/api/v1/hr` | `modules/hr/hrRouter.ts` aggregates employees, positions, skills, contracts |
| `/api/v1/admin/users` (Admin, HR) | `modules/admin/users/userRouter.ts` |
| `/api/v1/company` | `modules/company/companyRouter.ts` aggregates companies, departments |

Inside each router, reads are open to any logged-in user and writes are behind `requireRole(["HR"])`.

## Tests

- `bun run test` runs against the Doppler `dev` config, which is the local Supabase on the developer's laptop (127.0.0.1:54322). The developer said it can be wiped.
- `resetDb()` deletes every row in every table, so never point the tests at stg or prd.
- The `dev` config has no `JWT_SECRET`. Until the developer adds one, run the tests with `JWT_SECRET=<anything> bun run test`. Logins on dev need it too.

## Developer's answers (2026-11-18)

- **Archive** only sets `isArchived: true` (and `departureDate`). Contracts and assignments are not touched. Normal reads hide archived employees.
- **User endpoints** never return the password. Every user query uses `omit: { password: true }`.
- **Employee PATCH** accepts any subset of fields. The matricule is never in the schema, and if a client sends one it is stripped.
- **Employee matricule** is built by the backend as `EMP-<hire year>-<hire month>-<number>`, e.g. `EMP-2024-08-001`. The code is in `hr/employees/matricule.ts`.
  - The number follows creation order, not hire date. It is the last part of the most recently created matricule, plus 1.
  - `hireDate` is required.
- **Ids of records that belong to an employee** are built from the employee matricule by `nextRecordId` in `hr/employees/matricule.ts`, e.g. `EMP-2024-08-001-S1`. The letters are spouses S, children C, parents P, emergency contacts EC, academic credentials AC and contracts CT. Position assignments keep their database uuid.
  - Numbering is per employee and per kind: the highest number already used, plus 1. A gap left by a delete is not refilled.
  - Clients never send these ids.
- **Deleting a linked user** is refused with a 409 that tells the caller to unlink first with `DELETE /api/v1/hr/employees/:matricule/link-user`.

## Decisions made where the brief was silent or contradicted itself

- `updateEmployee` maps the schema field `MarriageRegime` to the `marriageRegime` column.
- link-user uses `linkUserToEmployeeSchema.omit({ matricule: true })`, because the matricule is in the URL.
- The unlink endpoint (`DELETE /:matricule/link-user`) is implemented.
- `changePassword` resolves the token id through `employee.userId` first. Tokens carry the matricule for linked employees.
- Per-employee contract routes live in `employeeRouter.ts`. There is no separate `employee-contract/contractRouter.ts`.
- `hr/contracts/` has no `contractSchema.ts`, because it is read-only.

## Open questions for the developer

- If the record with the highest number is deleted, its number is handed out again. Preventing that fully needs a counter column, which means a schema change.
- `SpouseSchema` and `academicCredentialSchema` still require `employeeMatricule` in the body, although the URL supplies it and the handler uses the URL. `childSchema` also accepts it.
- If two employees are created at the same instant, they can get the same number and the second create fails with a 500. Is that acceptable for now?
- `employee.schema.ts` and `spouse.schema.ts` still use `import { z }` instead of `import * as z`.
- `auth.ts` still has an empty `linkUserToEmployee` stub. The real one is in `hr/employees/employee.ts`.
- Putting `user.Id` in the JWT instead of the matricule/username would simplify `changePassword` (TODO in code).
