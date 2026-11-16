import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedOrgStructure, seedSkill } from "./helpers"

const app = buildTestApp()
let hrToken: string
let departmentId: string
let positionId: string

beforeAll(async () => {
    hrToken = await issueTestToken("TEST-HR-001", "HR")
})

beforeEach(async () => {
    await resetDb()
    const { department, position } = await seedOrgStructure()
    departmentId = department.departmentId
    positionId = position.id
})

describe("positions CRUD", () => {
    test("201 creates, 200 gets, updates and deletes a position", async () => {
        const created = await request(app)
            .post("/api/v1/positions")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ title: "Cashier", description: "Handles the till", departmentId: departmentId })
        expect(created.status).toBe(201)
        const id = created.body.id

        const one = await request(app)
            .get(`/api/v1/positions/${id}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(one.status).toBe(200)
        expect(one.body.title).toBe("Cashier")

        const updated = await request(app)
            .patch(`/api/v1/positions/${id}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ supervisorId: positionId })
        expect(updated.status).toBe(200)
        expect(updated.body.supervisorId).toBe(positionId)

        const subordinates = await request(app)
            .get(`/api/v1/positions/${positionId}/subordinates`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(subordinates.status).toBe(200)
        expect(subordinates.body.length).toBe(1)

        const deleted = await request(app)
            .delete(`/api/v1/positions/${id}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(deleted.status).toBe(200)
    })

    test("409 when a position supervises itself", async () => {
        const res = await request(app)
            .patch(`/api/v1/positions/${positionId}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ supervisorId: positionId })
        expect(res.status).toBe(409)
    })

    test("400 on missing title", async () => {
        const res = await request(app)
            .post("/api/v1/positions")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ description: "No title", departmentId: departmentId })
        expect(res.status).toBe(400)
    })

    test("404 for unknown position", async () => {
        const res = await request(app)
            .get("/api/v1/positions/00000000-0000-0000-0000-000000000000")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})

describe("position skills", () => {
    test("201 adds, 200 lists, updates and deletes a required skill", async () => {
        const skill = await seedSkill()

        const added = await request(app)
            .post(`/api/v1/positions/${positionId}/skills`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ skillId: skill.id, requiredLevel: "INTERMEDIATE", isMandatory: true })
        expect(added.status).toBe(201)

        const list = await request(app)
            .get(`/api/v1/positions/${positionId}/skills`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(list.status).toBe(200)
        expect(list.body.length).toBe(1)

        const updated = await request(app)
            .patch(`/api/v1/positions/${positionId}/skills/${skill.id}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ requiredLevel: "EXPERT" })
        expect(updated.status).toBe(200)
        expect(updated.body.requiredLevel).toBe("EXPERT")

        const deleted = await request(app)
            .delete(`/api/v1/positions/${positionId}/skills/${skill.id}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(deleted.status).toBe(200)
    })
})
