import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedEmployee, seedOrgStructure } from "./helpers"
import { prisma } from "../lib/prisma"

const app = buildTestApp()
let hrToken: string
let positionId: string
let serviceId: string

beforeAll(async () => {
    hrToken = await issueTestToken("TEST-HR-001", "HR")
})

beforeEach(async () => {
    await resetDb()
    await seedEmployee("EMP-001")
    const { position, department } = await seedOrgStructure()
    positionId = position.id
    serviceId = department.departmentId
})

const validContract = () => ({
    contractType: "CDI",
    signedDate: "2024-01-01",
    startDate: "2024-01-15",
    baseSalaryAtSigning: 350000,
    positionId: positionId,
    serviceId: serviceId
})

const seedContract = async () => {
    return await prisma.contract.create({
        data: {
            employeeMatricule: "EMP-001",
            contractType: "CDI",
            signedDate: new Date("2024-01-01"),
            startDate: new Date("2024-01-15"),
            baseSalaryAtSigning: 350000,
            positionId: positionId,
            serviceId: serviceId
        }
    })
}

describe("POST /api/v1/hr/employees/:matricule/contracts", () => {
    test("201 creates a contract", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/contracts")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(validContract())
        expect(res.status).toBe(201)
        expect(res.body.employeeMatricule).toBe("EMP-001")
    })

    test("400 on bad contractType", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/contracts")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ ...validContract(), contractType: "FREELANCE" })
        expect(res.status).toBe(400)
    })
})

describe("GET /api/v1/hr/employees/:matricule/contracts", () => {
    test("200 lists the contracts", async () => {
        await seedContract()
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/contracts")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1)
    })
})

describe("GET /api/v1/hr/employees/:matricule/contracts/:contractId", () => {
    test("200 returns the contract", async () => {
        const contract = await seedContract()
        const res = await request(app)
            .get(`/api/v1/hr/employees/EMP-001/contracts/${contract.contractId}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.contractId).toBe(contract.contractId)
    })

    test("404 for unknown contract", async () => {
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/contracts/00000000-0000-0000-0000-000000000000")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})

describe("PATCH /api/v1/hr/employees/:matricule/contracts/:contractId", () => {
    test("200 updates the contract", async () => {
        const contract = await seedContract()
        const res = await request(app)
            .patch(`/api/v1/hr/employees/EMP-001/contracts/${contract.contractId}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ baseSalaryAtSigning: 400000 })
        expect(res.status).toBe(200)
        expect(res.body.baseSalaryAtSigning).toBe(400000)
    })

    test("400 on bad salary", async () => {
        const contract = await seedContract()
        const res = await request(app)
            .patch(`/api/v1/hr/employees/EMP-001/contracts/${contract.contractId}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ baseSalaryAtSigning: -5 })
        expect(res.status).toBe(400)
    })
})

describe("POST /api/v1/hr/employees/:matricule/contracts/:contractId/terminate", () => {
    test("200 terminates the contract", async () => {
        const contract = await seedContract()
        const res = await request(app)
            .post(`/api/v1/hr/employees/EMP-001/contracts/${contract.contractId}/terminate`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ terminationDate: "2026-06-30", terminationReason: "RESIGNATION" })
        expect(res.status).toBe(200)
        expect(res.body.terminationReason).toBe("RESIGNATION")
    })

    test("400 on bad terminationReason", async () => {
        const contract = await seedContract()
        const res = await request(app)
            .post(`/api/v1/hr/employees/EMP-001/contracts/${contract.contractId}/terminate`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ terminationDate: "2026-06-30", terminationReason: "VIBES" })
        expect(res.status).toBe(400)
    })
})
