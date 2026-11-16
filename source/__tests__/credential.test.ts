import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedEmployee } from "./helpers"
import { prisma } from "../lib/prisma"

const app = buildTestApp()
let hrToken: string

const validCredential = {
    employeeMatricule: "EMP-001",
    degreeName: "BSc Accounting",
    institutionAttended: "University of Douala",
    fieldOfStudy: "Accounting",
    startDate: "2010-09-01",
    completionDate: "2013-06-30",
    gradeEarned: 15,
    gradeScale: 20,
    issueDate: "2013-07-15"
}

const seedCredential = async () => {
    return await prisma.academicCredential.create({
        data: {
            ...validCredential,
            startDate: new Date(validCredential.startDate),
            completionDate: new Date(validCredential.completionDate),
            issueDate: new Date(validCredential.issueDate)
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

describe("POST /api/v1/hr/employees/:matricule/academic-credentials", () => {
    test("201 adds a credential", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/academic-credentials")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(validCredential)
        expect(res.status).toBe(201)
        expect(res.body.degreeName).toBe("BSc Accounting")
    })

    test("400 on missing degreeName", async () => {
        const { degreeName, ...body } = validCredential
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/academic-credentials")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(body)
        expect(res.status).toBe(400)
    })
})

describe("GET /api/v1/hr/employees/:matricule/academic-credentials", () => {
    test("200 lists the credentials", async () => {
        await seedCredential()
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/academic-credentials")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1)
    })
})

describe("GET /api/v1/hr/employees/:matricule/academic-credentials/:id", () => {
    test("200 returns the credential", async () => {
        const credential = await seedCredential()
        const res = await request(app)
            .get(`/api/v1/hr/employees/EMP-001/academic-credentials/${credential.id}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.id).toBe(credential.id)
    })

    test("404 for unknown credential", async () => {
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/academic-credentials/00000000-0000-0000-0000-000000000000")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})

describe("PATCH /api/v1/hr/employees/:matricule/academic-credentials/:id", () => {
    test("200 updates the credential", async () => {
        const credential = await seedCredential()
        const res = await request(app)
            .patch(`/api/v1/hr/employees/EMP-001/academic-credentials/${credential.id}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ ...validCredential, gradeEarned: 17, employeeMatricule: undefined })
        expect(res.status).toBe(200)
        expect(res.body.gradeEarned).toBe(17)
    })

    test("400 on bad gradeEarned", async () => {
        const credential = await seedCredential()
        const res = await request(app)
            .patch(`/api/v1/hr/employees/EMP-001/academic-credentials/${credential.id}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ ...validCredential, gradeEarned: "excellent", employeeMatricule: undefined })
        expect(res.status).toBe(400)
    })
})

describe("DELETE /api/v1/hr/employees/:matricule/academic-credentials/:id", () => {
    test("200 deletes the credential", async () => {
        const credential = await seedCredential()
        const res = await request(app)
            .delete(`/api/v1/hr/employees/EMP-001/academic-credentials/${credential.id}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
    })
})
