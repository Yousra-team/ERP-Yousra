import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedEmployee, seedOrgStructure } from "./helpers"
import { prisma } from "../lib/prisma"

const app = buildTestApp()
let hrToken: string
let positionId: string

beforeAll(async () => {
    hrToken = await issueTestToken("TEST-HR-001", "HR")
})

beforeEach(async () => {
    await resetDb()
    await seedEmployee("EMP-001")
    const { position } = await seedOrgStructure()
    positionId = position.id
})

const seedAssignment = async () => {
    return await prisma.employeePosition.create({
        data: {
            employeeMatricule: "EMP-001",
            positionId: positionId,
            assignmentType: "PRIMARY",
            startDate: new Date("2024-01-01")
        }
    })
}

describe("POST /api/v1/hr/employees/:matricule/positions", () => {
    test("200 assigns the position", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/positions")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({
                employeeMatricule: "EMP-001",
                positionId: positionId,
                assignmentType: "PRIMARY",
                startDate: "2024-01-01"
            })
        expect(res.status).toBe(200)
        expect(res.body.positionId).toBe(positionId)
    })

    test("400 on bad assignmentType", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/positions")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({
                employeeMatricule: "EMP-001",
                positionId: positionId,
                assignmentType: "FOREVER",
                startDate: "2024-01-01"
            })
        expect(res.status).toBe(400)
    })
})

describe("GET /api/v1/hr/employees/:matricule/positions", () => {
    test("200 lists the assignments", async () => {
        await seedAssignment()
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/positions")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1)
    })
})

describe("GET /api/v1/hr/employees/:matricule/positions/:assignmentId", () => {
    test("200 returns the assignment", async () => {
        const assignment = await seedAssignment()
        const res = await request(app)
            .get(`/api/v1/hr/employees/EMP-001/positions/${assignment.assignmentId}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.assignmentId).toBe(assignment.assignmentId)
    })

    test("404 for unknown assignment", async () => {
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/positions/00000000-0000-0000-0000-000000000000")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})

describe("PATCH /api/v1/hr/employees/:matricule/positions/:assignmentId", () => {
    test("200 updates the assignment", async () => {
        const assignment = await seedAssignment()
        const res = await request(app)
            .patch(`/api/v1/hr/employees/EMP-001/positions/${assignment.assignmentId}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ assignmentType: "ACTING", startDate: "2024-01-01", notes: "Interim cover" })
        expect(res.status).toBe(200)
        expect(res.body.assignmentType).toBe("ACTING")
    })

    test("400 on bad startDate", async () => {
        const assignment = await seedAssignment()
        const res = await request(app)
            .patch(`/api/v1/hr/employees/EMP-001/positions/${assignment.assignmentId}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ assignmentType: "ACTING", startDate: "not-a-date" })
        expect(res.status).toBe(400)
    })
})

describe("POST /api/v1/hr/employees/:matricule/positions/:assignmentId/end", () => {
    test("200 ends the assignment", async () => {
        const assignment = await seedAssignment()
        const res = await request(app)
            .post(`/api/v1/hr/employees/EMP-001/positions/${assignment.assignmentId}/end`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ endDate: "2026-01-31" })
        expect(res.status).toBe(200)
        expect(res.body.endDate).not.toBeNull()
    })

    test("400 on missing endDate", async () => {
        const assignment = await seedAssignment()
        const res = await request(app)
            .post(`/api/v1/hr/employees/EMP-001/positions/${assignment.assignmentId}/end`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({})
        expect(res.status).toBe(400)
    })
})
