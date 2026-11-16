import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedEmployee, seedSpouse } from "./helpers"
import { prisma } from "../lib/prisma"

const app = buildTestApp()
let hrToken: string

const validChild = {
    childMatricule: "CH-2026-001",
    employeeMatricule: "EMP-001",
    spouseMatricule: "SP-2026-001",
    firstName: "Junior",
    lastName: "Ngono",
    dateOfBirth: "2018-03-15",
    gender: "male" as const,
    isDependent: true,
    birthCertificateNo: "BC-001"
}

const seedChild = async () => {
    await prisma.employeeChild.create({
        data: { ...validChild, dateOfBirth: new Date(validChild.dateOfBirth) }
    })
}

beforeAll(async () => {
    hrToken = await issueTestToken("TEST-HR-001", "HR")
})

beforeEach(async () => {
    await resetDb()
    await seedEmployee("EMP-001")
    await seedSpouse("EMP-001", "SP-2026-001")
})

describe("POST /api/v1/hr/employees/:matricule/children", () => {
    test("201 adds a child", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/children")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(validChild)
        expect(res.status).toBe(201)
        expect(res.body.childMatricule).toBe("CH-2026-001")
    })

    test("400 on missing firstName", async () => {
        const { firstName, ...body } = validChild
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/children")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(body)
        expect(res.status).toBe(400)
    })
})

describe("GET /api/v1/hr/employees/:matricule/children", () => {
    test("200 lists the children", async () => {
        await seedChild()
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/children")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.babies.children.length).toBe(1)
    })
})

describe("GET /api/v1/hr/employees/:matricule/children/:childMatricule", () => {
    test("200 returns the child", async () => {
        await seedChild()
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/children/CH-2026-001")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.childMatricule).toBe("CH-2026-001")
    })

    test("404 for unknown child", async () => {
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/children/UNKNOWN")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})

describe("PATCH /api/v1/hr/employees/:matricule/children/:childMatricule", () => {
    test("200 updates the child", async () => {
        await seedChild()
        const res = await request(app)
            .patch("/api/v1/hr/employees/EMP-001/children/CH-2026-001")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ isDependent: false })
        expect(res.status).toBe(200)
        expect(res.body.isDependent).toBe(false)
    })

    test("400 on bad date", async () => {
        await seedChild()
        const res = await request(app)
            .patch("/api/v1/hr/employees/EMP-001/children/CH-2026-001")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ dateOfBirth: "not-a-date" })
        expect(res.status).toBe(400)
    })
})

describe("DELETE /api/v1/hr/employees/:matricule/children/:childMatricule", () => {
    test("200 deletes the child", async () => {
        await seedChild()
        const res = await request(app)
            .delete("/api/v1/hr/employees/EMP-001/children/CH-2026-001")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
    })
})
