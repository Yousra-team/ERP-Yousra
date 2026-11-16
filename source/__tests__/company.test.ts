import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb } from "./helpers"
import { prisma } from "../lib/prisma"

const app = buildTestApp()
let hrToken: string

beforeAll(async () => {
    hrToken = await issueTestToken("TEST-HR-001", "HR")
})

beforeEach(async () => {
    await resetDb()
})

describe("companies CRUD", () => {
    test("201 creates, 200 lists, gets, updates and deletes a company", async () => {
        const created = await request(app)
            .post("/api/v1/companies")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ name: "Yousra", creationDate: "2010-01-01", isParent: true })
        expect(created.status).toBe(201)
        const id = created.body.id

        const list = await request(app)
            .get("/api/v1/companies")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(list.status).toBe(200)
        expect(list.body.length).toBe(1)

        const one = await request(app)
            .get(`/api/v1/companies/${id}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(one.status).toBe(200)
        expect(one.body.name).toBe("Yousra")

        const updated = await request(app)
            .patch(`/api/v1/companies/${id}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ name: "Yousra Group" })
        expect(updated.status).toBe(200)
        expect(updated.body.name).toBe("Yousra Group")

        const deleted = await request(app)
            .delete(`/api/v1/companies/${id}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(deleted.status).toBe(200)
        expect(await prisma.company.count()).toBe(0)
    })

    test("400 on missing name", async () => {
        const res = await request(app)
            .post("/api/v1/companies")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ creationDate: "2010-01-01", isParent: true })
        expect(res.status).toBe(400)
    })

    test("404 for unknown company", async () => {
        const res = await request(app)
            .get("/api/v1/companies/00000000-0000-0000-0000-000000000000")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})
