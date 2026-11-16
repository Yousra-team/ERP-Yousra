import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedEmployee } from "./helpers"

const app = buildTestApp()
let hrToken: string

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
    residenceAddressLine: "Douala",
    user: { role: "Employee", password: "password123" }
}

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
            .send(validEmployee)
        expect(res.status).toBe(201)
        expect(res.body.employeeMatricule).toBe("EMP-001")
    })

    test("400 on missing firstName", async () => {
        const { firstName, ...body } = validEmployee
        const res = await request(app)
            .post("/api/v1/hr/employees")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(body)
        expect(res.status).toBe(400)
        expect(res.body.message).toBe("Bad Schema")
    })
})

describe("GET /api/v1/hr/employees", () => {
    test("200 lists active employees", async () => {
        await seedEmployee("EMP-001")
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

describe("POST /api/v1/hr/employees/:matricule/archive", () => {
    test("200 archives the employee", async () => {
        await seedEmployee("EMP-001")
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/archive")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ terminationReason: "RESIGNATION", effectiveDate: "2026-01-31" })
        expect(res.status).toBe(200)
        expect(res.body.employee.isArchived).toBe(true)
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
        await seedEmployee("EMP-001", { isArchived: true })
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/restore")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.employee.isArchived).toBe(false)
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
