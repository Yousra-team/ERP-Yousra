import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedEmployee, seedSkill } from "./helpers"
import { prisma } from "../lib/prisma"

const app = buildTestApp()
let hrToken: string
let skillId: string

beforeAll(async () => {
    hrToken = await issueTestToken("TEST-HR-001", "HR")
})

beforeEach(async () => {
    await resetDb()
    await seedEmployee("EMP-001")
    const skill = await seedSkill()
    skillId = skill.id
})

const seedEmployeeSkill = async () => {
    await prisma.employeeSkill.create({
        data: {
            employeeMatricule: "EMP-001",
            skillId: skillId,
            proficiencyLevel: "INTERMEDIATE"
        }
    })
}

describe("POST /api/v1/hr/employees/:matricule/skills", () => {
    test("200 adds a skill to the employee", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/skills")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ employeeMatricule: "EMP-001", skillId: skillId, proficiencyLevel: "BEGINNER" })
        expect(res.status).toBe(200)
        expect(res.body.skillId).toBe(skillId)
    })

    test("400 on bad proficiencyLevel", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/skills")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ employeeMatricule: "EMP-001", skillId: skillId, proficiencyLevel: "GURU" })
        expect(res.status).toBe(400)
    })
})

describe("GET /api/v1/hr/employees/:matricule/skills", () => {
    test("200 lists the employee skills", async () => {
        await seedEmployeeSkill()
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/skills")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1)
    })
})

describe("GET /api/v1/hr/employees/:matricule/skills/:skillId", () => {
    test("200 returns the employee skill", async () => {
        await seedEmployeeSkill()
        const res = await request(app)
            .get(`/api/v1/hr/employees/EMP-001/skills/${skillId}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.skillId).toBe(skillId)
    })

    test("404 for unknown skill", async () => {
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/skills/00000000-0000-0000-0000-000000000000")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})

describe("PATCH /api/v1/hr/employees/:matricule/skills/:skillId", () => {
    test("200 updates the proficiency", async () => {
        await seedEmployeeSkill()
        const res = await request(app)
            .patch(`/api/v1/hr/employees/EMP-001/skills/${skillId}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ proficiencyLevel: "EXPERT" })
        expect(res.status).toBe(200)
        expect(res.body.proficiencyLevel).toBe("EXPERT")
    })

    test("400 on bad proficiencyLevel", async () => {
        await seedEmployeeSkill()
        const res = await request(app)
            .patch(`/api/v1/hr/employees/EMP-001/skills/${skillId}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ proficiencyLevel: "GURU" })
        expect(res.status).toBe(400)
    })
})

describe("DELETE /api/v1/hr/employees/:matricule/skills/:skillId", () => {
    test("200 removes the skill", async () => {
        await seedEmployeeSkill()
        const res = await request(app)
            .delete(`/api/v1/hr/employees/EMP-001/skills/${skillId}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
    })
})
