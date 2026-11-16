import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb } from "./helpers"
import { prisma } from "../lib/prisma"

const app = buildTestApp()
let hrToken: string
let companyId: string

beforeAll(async () => {
    hrToken = await issueTestToken("TEST-HR-001", "HR")
})

beforeEach(async () => {
    await resetDb()
    const company = await prisma.company.create({
        data: { name: "Yousra", creationDate: new Date("2010-01-01"), isParent: true }
    })
    companyId = company.id
})

describe("departments CRUD", () => {
    test("201 creates, 200 lists children, updates and deletes a department", async () => {
        const created = await request(app)
            .post("/api/v1/departments")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ companyId: companyId, name: "Finance", description: "Finance dept", isActive: true })
        expect(created.status).toBe(201)
        const id = created.body.departmentId

        const child = await request(app)
            .post("/api/v1/departments")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ companyId: companyId, name: "Treasury", parentDepartmentId: id, description: "Sub dept", isActive: true })
        expect(child.status).toBe(201)

        const children = await request(app)
            .get(`/api/v1/departments/${id}/children`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(children.status).toBe(200)
        expect(children.body.length).toBe(1)

        const updated = await request(app)
            .patch(`/api/v1/departments/${id}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ name: "Finance & Admin" })
        expect(updated.status).toBe(200)
        expect(updated.body.name).toBe("Finance & Admin")

        const deleted = await request(app)
            .delete(`/api/v1/departments/${child.body.departmentId}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(deleted.status).toBe(200)
    })

    test("400 on missing companyId", async () => {
        const res = await request(app)
            .post("/api/v1/departments")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ name: "Finance", description: "Finance dept", isActive: true })
        expect(res.status).toBe(400)
    })

    test("404 for unknown department", async () => {
        const res = await request(app)
            .get("/api/v1/departments/00000000-0000-0000-0000-000000000000")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})
