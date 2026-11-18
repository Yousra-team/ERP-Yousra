import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb } from "./helpers"

const app = buildTestApp()
let hrToken: string

beforeAll(async () => {
    hrToken = await issueTestToken("TEST-HR-001", "HR")
})

beforeEach(async () => {
    await resetDb()
})

describe("skills CRUD", () => {
    test("201 creates, 200 lists, gets, updates and deletes a skill", async () => {
        const created = await request(app)
            .post("/api/v1/hr/skills")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ name: "French", category: "LANGUAGE" })
        expect(created.status).toBe(201)
        const id = created.body.id

        const list = await request(app)
            .get("/api/v1/hr/skills")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(list.status).toBe(200)
        expect(list.body.length).toBe(1)

        const one = await request(app)
            .get(`/api/v1/hr/skills/${id}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(one.status).toBe(200)
        expect(one.body.name).toBe("French")

        const updated = await request(app)
            .patch(`/api/v1/hr/skills/${id}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ description: "Spoken and written" })
        expect(updated.status).toBe(200)
        expect(updated.body.description).toBe("Spoken and written")

        const deleted = await request(app)
            .delete(`/api/v1/hr/skills/${id}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(deleted.status).toBe(200)
    })

    test("400 on bad category", async () => {
        const res = await request(app)
            .post("/api/v1/hr/skills")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ name: "French", category: "MAGIC" })
        expect(res.status).toBe(400)
    })

    test("404 for unknown skill", async () => {
        const res = await request(app)
            .get("/api/v1/hr/skills/00000000-0000-0000-0000-000000000000")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})
