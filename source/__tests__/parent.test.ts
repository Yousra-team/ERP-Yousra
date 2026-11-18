import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedEmployee } from "./helpers"
import { prisma } from "../lib/prisma"

const app = buildTestApp()
let hrToken: string

// no parentMatricule, the backend builds it from the employee matricule
const validParent = {
    firstName: "Paul",
    lastName: "Ngono",
    isAlive: true,
    dateOfBirth: "1960-01-01",
    gender: "male" as const,
    isDependent: false
}

const seedParent = async () => {
    await prisma.employeeParent.create({
        data: {
            ...validParent,
            parentMatricule: "EMP-001-P1",
            dateOfBirth: new Date(validParent.dateOfBirth),
            employeeMatricule: "EMP-001"
        }
    })
}

beforeAll(async () => {
    hrToken = await issueTestToken("TEST-HR-001", "HR")
})

beforeEach(async () => {
    await resetDb()
    await seedEmployee("EMP-001")
})

describe("POST /api/v1/hr/employees/:matricule/parents", () => {
    test("201 adds a parent", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/parents")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(validParent)
        expect(res.status).toBe(201)
        expect(res.body.parentMatricule).toBe("EMP-001-P1")
    })

    test("400 on missing isAlive", async () => {
        const { isAlive, ...body } = validParent
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/parents")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(body)
        expect(res.status).toBe(400)
    })
})

describe("GET /api/v1/hr/employees/:matricule/parents", () => {
    test("200 lists the parents", async () => {
        await seedParent()
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/parents")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.parents.length).toBe(1)
    })
})

describe("GET /api/v1/hr/employees/:matricule/parents/:parentMatricule", () => {
    test("200 returns the parent", async () => {
        await seedParent()
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/parents/EMP-001-P1")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.parentMatricule).toBe("EMP-001-P1")
    })

    test("404 for unknown parent", async () => {
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/parents/UNKNOWN")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})

describe("PATCH /api/v1/hr/employees/:matricule/parents/:parentMatricule", () => {
    test("200 updates the parent", async () => {
        await seedParent()
        const res = await request(app)
            .patch("/api/v1/hr/employees/EMP-001/parents/EMP-001-P1")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ isDependent: true })
        expect(res.status).toBe(200)
        expect(res.body.isDependent).toBe(true)
    })

    test("400 on bad gender", async () => {
        await seedParent()
        const res = await request(app)
            .patch("/api/v1/hr/employees/EMP-001/parents/EMP-001-P1")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ gender: "other" })
        expect(res.status).toBe(400)
    })
})

describe("DELETE /api/v1/hr/employees/:matricule/parents/:parentMatricule", () => {
    test("200 deletes the parent", async () => {
        await seedParent()
        const res = await request(app)
            .delete("/api/v1/hr/employees/EMP-001/parents/EMP-001-P1")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
    })
})
