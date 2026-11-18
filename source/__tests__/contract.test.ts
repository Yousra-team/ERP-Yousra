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

const seedContract = async (contractType: "CDI" | "CDD", endDate: Date | null) => {
    return await prisma.contract.create({
        data: {
            employeeMatricule: "EMP-001",
            contractType: contractType,
            signedDate: new Date("2024-01-01"),
            startDate: new Date("2024-01-15"),
            endDate: endDate,
            baseSalaryAtSigning: 350000,
            positionId: positionId,
            serviceId: serviceId
        }
    })
}

describe("GET /api/v1/hr/contracts", () => {
    test("200 lists every contract", async () => {
        await seedContract("CDI", null)
        const res = await request(app)
            .get("/api/v1/hr/contracts")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1)
    })
})

describe("GET /api/v1/hr/contracts/expiring", () => {
    test("200 returns only fixed-term contracts ending within 60 days", async () => {
        const soon = new Date()
        soon.setDate(soon.getDate() + 30)
        await seedContract("CDD", soon)
        await seedContract("CDI", null) // open ended, must not appear
        const res = await request(app)
            .get("/api/v1/hr/contracts/expiring")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1)
        expect(res.body[0].contractType).toBe("CDD")
    })
})

describe("GET /api/v1/hr/contracts/:contractId", () => {
    test("200 returns the contract", async () => {
        const contract = await seedContract("CDI", null)
        const res = await request(app)
            .get(`/api/v1/hr/contracts/${contract.contractId}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.contractId).toBe(contract.contractId)
    })

    test("404 for unknown contract", async () => {
        const res = await request(app)
            .get("/api/v1/hr/contracts/00000000-0000-0000-0000-000000000000")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})
