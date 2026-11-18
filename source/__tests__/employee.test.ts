import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedEmployee, seedUser } from "./helpers"

const app = buildTestApp()
let hrToken: string
let employeeToken: string

// no user in here anymore, HR links one later with /link-user
const validEmployee = {
    employeeMatricule: "EMP-001",
    firstName: "Awa",
    lastName: "Ngono",
    gender: "male",
    dateOfBirth: "1990-01-01",
    hireDate: "2020-01-01",
    country: "Cameroon",
    maritalStatus: "SINGLE",
    MarriageRegime: "MONOGAMOUS",
    phone: "+237655555555",
    email: "awa.ngono@test.com",
    residenceAddressLine: "Douala"
}

beforeAll(async () => {
    hrToken = await issueTestToken("TEST-HR-001", "HR")
    employeeToken = await issueTestToken("TEST-EMP-001", "Employee")
})

beforeEach(async () => {
    await resetDb()
})

describe("POST /api/v1/hr/employees", () => {
    // Happy path — HR creates a new hire
    test("201 creates an employee", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(validEmployee)
        expect(res.status).toBe(201)
        expect(res.body.employeeMatricule).toBe("EMP-001")
        expect(res.body.userId).toBeNull()
    })

    // Validation failure
    test("400 on missing firstName", async () => {
        const { firstName, ...body } = validEmployee
        const res = await request(app)
            .post("/api/v1/hr/employees")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(body)
        expect(res.status).toBe(400)
        expect(res.body.message).toBe("Bad Schema")
    })

    // Same matricule twice
    test("409 on duplicate matricule", async () => {
        await seedEmployee("EMP-001")
        const res = await request(app)
            .post("/api/v1/hr/employees")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(validEmployee)
        expect(res.status).toBe(409)
    })

    // Writes are HR only
    test("403 for a non HR role", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees")
            .set("Authorization", `Bearer ${employeeToken}`)
            .send(validEmployee)
        expect(res.status).toBe(403)
    })

    // No token at all
    test("401 without a token", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees")
            .send(validEmployee)
        expect(res.status).toBe(401)
    })
})

describe("GET /api/v1/hr/employees", () => {
    test("200 lists active employees", async () => {
        await seedEmployee("EMP-001")
        await seedEmployee("EMP-002", { isArchived: true })
        const res = await request(app)
            .get("/api/v1/hr/employees")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1)
    })
})

describe("GET /api/v1/hr/employees/:matricule", () => {
    test("200 returns the employee", async () => {
        await seedEmployee("EMP-001")
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.employeeMatricule).toBe("EMP-001")
    })

    test("404 for unknown matricule", async () => {
        const res = await request(app)
            .get("/api/v1/hr/employees/UNKNOWN")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})

describe("PATCH /api/v1/hr/employees/:matricule", () => {
    // update schema isn't partial so the whole body goes up
    test("200 updates the employee", async () => {
        await seedEmployee("EMP-001")
        const { employeeMatricule, ...body } = validEmployee
        const res = await request(app)
            .patch("/api/v1/hr/employees/EMP-001")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ ...body, MarriageRegime: "POLYGAMOUS" })
        expect(res.status).toBe(200)
        expect(res.body.marriageRegime).toBe("POLYGAMOUS")
    })

    test("400 on bad gender", async () => {
        await seedEmployee("EMP-001")
        const { employeeMatricule, ...body } = validEmployee
        const res = await request(app)
            .patch("/api/v1/hr/employees/EMP-001")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ ...body, gender: "other" })
        expect(res.status).toBe(400)
    })
})

describe("POST /api/v1/hr/employees/:matricule/archive", () => {
    test("200 archives the employee", async () => {
        await seedEmployee("EMP-001")
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/archive")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ terminationReason: "RESIGNATION", effectiveDate: "2026-01-31" })
        expect(res.status).toBe(200)
        expect(res.body.employee.isArchived).toBe(true)
        expect(res.body.employee.departureDate).not.toBeNull()
    })

    test("400 on bad body", async () => {
        await seedEmployee("EMP-001")
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/archive")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ effectiveDate: "not-a-date" })
        expect(res.status).toBe(400)
    })
})

describe("POST /api/v1/hr/employees/:matricule/restore", () => {
    test("200 restores an archived employee", async () => {
        await seedEmployee("EMP-001", { isArchived: true, departureDate: new Date("2026-01-31") })
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/restore")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.employee.isArchived).toBe(false)
        expect(res.body.employee.departureDate).toBeNull()
    })
})

describe("GET /api/v1/hr/employees/archived", () => {
    test("200 lists only archived employees", async () => {
        await seedEmployee("EMP-001", { isArchived: true })
        await seedEmployee("EMP-002")
        const res = await request(app)
            .get("/api/v1/hr/employees/archived")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1)
    })
})

describe("GET /api/v1/hr/employees/archived/:matricule", () => {
    test("200 returns the archived employee", async () => {
        await seedEmployee("EMP-001", { isArchived: true })
        const res = await request(app)
            .get("/api/v1/hr/employees/archived/EMP-001")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.employeeMatricule).toBe("EMP-001")
    })

    test("404 when the employee is not archived", async () => {
        await seedEmployee("EMP-001")
        const res = await request(app)
            .get("/api/v1/hr/employees/archived/EMP-001")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})

describe("POST /api/v1/hr/employees/:matricule/link-user", () => {
    // Happy path — HR gives the new hire a login
    test("200 links the user", async () => {
        await seedEmployee("EMP-001")
        const user = await seedUser("awa.ngono")
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/link-user")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ userId: user.Id })
        expect(res.status).toBe(200)
        expect(res.body.userId).toBe(user.Id)
    })

    test("400 on missing userId", async () => {
        await seedEmployee("EMP-001")
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/link-user")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({})
        expect(res.status).toBe(400)
    })

    test("404 for unknown user", async () => {
        await seedEmployee("EMP-001")
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/link-user")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ userId: "00000000-0000-0000-0000-000000000000" })
        expect(res.status).toBe(404)
    })

    // one user can only sit on one employee
    test("409 when the user is already linked elsewhere", async () => {
        const user = await seedUser("awa.ngono")
        await seedEmployee("EMP-001", { userId: user.Id })
        await seedEmployee("EMP-002")
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-002/link-user")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ userId: user.Id })
        expect(res.status).toBe(409)
    })
})

describe("DELETE /api/v1/hr/employees/:matricule/link-user", () => {
    test("200 unlinks the user", async () => {
        const user = await seedUser("awa.ngono")
        await seedEmployee("EMP-001", { userId: user.Id })
        const res = await request(app)
            .delete("/api/v1/hr/employees/EMP-001/link-user")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.userId).toBeNull()
    })

    test("404 for unknown employee", async () => {
        const res = await request(app)
            .delete("/api/v1/hr/employees/UNKNOWN/link-user")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})
