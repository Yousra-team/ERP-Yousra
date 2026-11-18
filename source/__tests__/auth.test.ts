import { describe, test, expect, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedEmployee, seedUser } from "./helpers"
import { verifyPassword } from "../lib/password"
import { prisma } from "../lib/prisma"

const app = buildTestApp()

beforeEach(async () => {
    await resetDb()
})

describe("POST /api/v1/auth/login", () => {
    // Happy path — returns the token as a plain string
    test("200 returns a token", async () => {
        await seedUser("awa.ngono", "password123")
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ username: "awa.ngono", password: "password123" })
        expect(res.status).toBe(200)
        expect(typeof res.body).toBe("string")
    })

    test("400 on wrong password", async () => {
        await seedUser("awa.ngono", "password123")
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ username: "awa.ngono", password: "wrongpassword" })
        expect(res.status).toBe(400)
    })

    test("404 for unknown username", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ username: "nobody", password: "password123" })
        expect(res.status).toBe(404)
    })
})

describe("POST /api/v1/auth/change-password", () => {
    // linked employees carry their matricule in the token, not the username
    test("200 changes the password of a linked employee", async () => {
        const user = await seedUser("awa.ngono", "password123")
        await seedEmployee("EMP-001", { userId: user.Id })
        const token = await issueTestToken("EMP-001", "Employee")

        const res = await request(app)
            .post("/api/v1/auth/change-password")
            .set("Authorization", `Bearer ${token}`)
            .send({ currentPassword: "password123", newPassword: "newpassword456" })
        expect(res.status).toBe(200)

        const updated = await prisma.user.findUnique({ where: { Id: user.Id } })
        expect(await verifyPassword("newpassword456", updated!.password)).toBe(true)
    })

    test("400 on wrong current password", async () => {
        await seedUser("awa.ngono", "password123")
        const token = await issueTestToken("awa.ngono", "Employee")
        const res = await request(app)
            .post("/api/v1/auth/change-password")
            .set("Authorization", `Bearer ${token}`)
            .send({ currentPassword: "wrongpassword", newPassword: "newpassword456" })
        expect(res.status).toBe(400)
    })

    test("401 without a token", async () => {
        const res = await request(app)
            .post("/api/v1/auth/change-password")
            .send({ currentPassword: "password123", newPassword: "newpassword456" })
        expect(res.status).toBe(401)
    })
})
