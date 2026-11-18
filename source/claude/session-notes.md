# Session notes (Claude)

Read this, `instructions.md` and `CLAUDE_CODE_BRIEF_hr_module.md` before starting work.

## State as of 2026-11-18

All 6 steps of the brief are coded and type-check (`bunx tsc --noEmit`). The server boots and every mount point answers.

| Mount | Router |
|---|---|
| `/api/v1/auth` (public) | `modules/auth/authRouter.ts` |
| `/api/v1/hr` | `modules/hr/hrRouter.ts` aggregates employees, positions, skills, contracts |
| `/api/v1/admin/users` (Admin, HR) | `modules/admin/users/userRouter.ts` |
| `/api/v1/company` | `modules/company/companyRouter.ts` aggregates companies, departments |

Inside each router, reads are open to any logged-in user and writes are behind `requireRole(["HR"])`.

## Tests have never been run

`bun run test` needs a Doppler config named `test` with its own `DATABASE_URL` and `JWT_SECRET`. That config does not exist yet (only dev, dev_personal, stg, prd).
`resetDb()` deletes every row in every table. Never point the tests at dev, stg or prd.

## Decisions made where the brief was silent or contradicted itself

- `createEmployee` returns 409 on a reused matricule. §8.3 asks for that test, and without the check it was a 500.
- `updateEmployee` maps the schema field `MarriageRegime` to the `marriageRegime` column. Spreading it straight in made every PATCH a Prisma error.
- link-user uses `linkUserToEmployeeSchema.omit({ matricule: true })`, because the matricule is in the URL and the body is `{ userId }`.
- The unlink endpoint (`DELETE /:matricule/link-user`, optional in §6.9) is implemented.
- `changePassword` resolves the token id through `employee.userId` first. Tokens carry the matricule for linked employees, and usernames are no longer matricules.
- Per-employee contract routes are wired in `employeeRouter.ts` under `// Contracts`. No separate `employee-contract/contractRouter.ts` was created, because it would be unused.
- `hr/contracts/` has no `contractSchema.ts`. It is read-only, so there is nothing to validate.

## Open questions for the developer

- Archiving: `archiveEmployee` says "1 contract terminated, 1 assignment ended" but changes neither (TODO in code). Should archive end them?
- `createUser`, `getUsers`, `getUserById` and `updateUser` send the password hash back in the response.
- `updateEmployeeSchema` is not `.partial()`, so a PATCH must send every field.
- `employee.schema.ts` and `spouse.schema.ts` still use `import { z }` instead of `import * as z`. Left alone because the files work.
- `auth.ts` still has an empty `linkUserToEmployee` stub. The real one is in `hr/employees/employee.ts`.
- Deleting a user that is linked to an employee fails with a 500 (foreign key). Unlink first, or handle it in `deleteUser`?
- Putting `user.Id` in the JWT instead of the matricule/username would simplify `changePassword` (TODO in code).
