import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedEmployee, seedSpouse } from "./helpers"

const app = buildTestApp()
let hrToken: string

const validSpouse = {
    spouseMatricule: "SP-2026-001",
    firstName: "Marie",
    lastName: "Ngono",
    dateOfBirth: "1992-05-10",
    gender: "female",
    cniNumber: "CNI-123456",
    marriageDate: "2015-06-20",
    isDependent: true,
    employeeMatricule: "EMP-001"
}

beforeAll(async () => {
    hrToken = await issueTestToken("TEST-HR-001", "HR")
})

beforeEach(async () => {
    await resetDb()
})

describe("POST /api/v1/hr/employees/:matricule/spouses", () => {
    test("201 adds a spouse and marks the employee married", async () => {
        await seedEmployee("EMP-001")
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/spouses")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(validSpouse)
        expect(res.status).toBe(201)
        expect(res.body.spouseMatricule).toBe("SP-2026-001")
    })

    test("400 on missing cniNumber", async () => {
        await seedEmployee("EMP-001")
        const { cniNumber, ...body } = validSpouse
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/spouses")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(body)
        expect(res.status).toBe(400)
    })

    test("404 for unknown employee", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees/UNKNOWN/spouses")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(validSpouse)
        expect(res.status).toBe(404)
    })

    test("409 when a monogamous employee already has a spouse", async () => {
        await seedEmployee("EMP-001")
        await seedSpouse("EMP-001", "SP-2026-000")
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/spouses")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(validSpouse)
        expect(res.status).toBe(409)
    })
})

describe("GET /api/v1/hr/employees/:matricule/spouses", () => {
    test("200 lists the spouses", async () => {
        await seedEmployee("EMP-001")
        await seedSpouse("EMP-001", "SP-2026-001")
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/spouses")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1)
    })
})

describe("GET /api/v1/hr/employees/:matricule/spouses/:spouseMatricule", () => {
    test("200 returns the spouse", async () => {
        await seedEmployee("EMP-001")
        await seedSpouse("EMP-001", "SP-2026-001")
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/spouses/SP-2026-001")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.spouses.length).toBe(1)
    })

    test("404 for unknown employee", async () => {
        const res = await request(app)
            .get("/api/v1/hr/employees/UNKNOWN/spouses/SP-2026-001")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})

describe("PATCH /api/v1/hr/employees/:matricule/spouses/:spouseMatricule", () => {
    test("200 updates the spouse", async () => {
        await seedEmployee("EMP-001")
        await seedSpouse("EMP-001", "SP-2026-001")
        const res = await request(app)
            .patch("/api/v1/hr/employees/EMP-001/spouses/SP-2026-001")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({
                firstName: "Updated",
                lastName: "Spouse",
                dateOfBirth: "1992-05-10",
                gender: "female",
                marriageDate: "2015-06-20",
                isDependent: false
            })
        expect(res.status).toBe(200)
        expect(res.body.firstName).toBe("Updated")
    })

    test("404 for unknown employee", async () => {
        const res = await request(app)
            .patch("/api/v1/hr/employees/UNKNOWN/spouses/SP-2026-001")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ isDependent: false })
        expect(res.status).toBe(404)
    })
})

describe("POST /api/v1/hr/employees/:matricule/spouses/:spouseMatricule/end", () => {
    test("200 ends the marriage", async () => {
        await seedEmployee("EMP-001")
        await seedSpouse("EMP-001", "SP-2026-001")
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/spouses/SP-2026-001/end")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ endedOn: "2026-02-01", endReason: "divorce" })
        expect(res.status).toBe(200)
        expect(res.body.isActive).toBe(false)
    })

    test("400 on bad endReason", async () => {
        await seedEmployee("EMP-001")
        await seedSpouse("EMP-001", "SP-2026-001")
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/spouses/SP-2026-001/end")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ endedOn: "2026-02-01", endReason: "boredom" })
        expect(res.status).toBe(400)
    })
})
