import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedEmployee, seedUser } from "./helpers"

const app = buildTestApp()
let adminToken: string

const validUser = {
    username: "awa.ngono",
    firstName: "Awa",
    lastName: "Ngono",
    role: "Employee",
    password: "password123"
}

beforeAll(async () => {
    adminToken = await issueTestToken("TEST-ADMIN-001", "Admin")
})

beforeEach(async () => {
    await resetDb()
})

describe("POST /api/v1/admin/users", () => {
    // Happy path — admin opens an account
    test("201 creates a user without sending the password back", async () => {
        const res = await request(app)
            .post("/api/v1/admin/users")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(validUser)
        expect(res.status).toBe(201)
        expect(res.body.username).toBe("awa.ngono")
        expect(res.body.password).toBeUndefined()
    })

    test("400 on short password", async () => {
        const res = await request(app)
            .post("/api/v1/admin/users")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ ...validUser, password: "short" })
        expect(res.status).toBe(400)
    })
})

describe("GET /api/v1/admin/users/:userId", () => {
    test("200 returns the user", async () => {
        const user = await seedUser("awa.ngono")
        const res = await request(app)
            .get(`/api/v1/admin/users/${user.Id}`)
            .set("Authorization", `Bearer ${adminToken}`)
        expect(res.status).toBe(200)
        expect(res.body.Id).toBe(user.Id)
        expect(res.body.password).toBeUndefined()
    })

    test("404 for unknown user", async () => {
        const res = await request(app)
            .get("/api/v1/admin/users/00000000-0000-0000-0000-000000000000")
            .set("Authorization", `Bearer ${adminToken}`)
        expect(res.status).toBe(404)
    })
})

describe("PATCH /api/v1/admin/users/:userId", () => {
    test("200 updates the user", async () => {
        const user = await seedUser("awa.ngono")
        const res = await request(app)
            .patch(`/api/v1/admin/users/${user.Id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ role: "HR" })
        expect(res.status).toBe(200)
        expect(res.body.role).toBe("HR")
    })

    test("400 on unknown role", async () => {
        const user = await seedUser("awa.ngono")
        const res = await request(app)
            .patch(`/api/v1/admin/users/${user.Id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ role: "Wizard" })
        expect(res.status).toBe(400)
    })
})

describe("DELETE /api/v1/admin/users/:userId", () => {
    test("200 deletes the user", async () => {
        const user = await seedUser("awa.ngono")
        const res = await request(app)
            .delete(`/api/v1/admin/users/${user.Id}`)
            .set("Authorization", `Bearer ${adminToken}`)
        expect(res.status).toBe(200)
    })

    // linked users have to be unlinked from their employee first
    test("409 when the user is linked to an employee", async () => {
        const user = await seedUser("awa.ngono")
        await seedEmployee("EMP-001", { userId: user.Id })
        const res = await request(app)
            .delete(`/api/v1/admin/users/${user.Id}`)
            .set("Authorization", `Bearer ${adminToken}`)
        expect(res.status).toBe(409)
    })
})
