import { describe, test, expect, beforeAll, beforeEach } from "bun:test"
import request from "supertest"
import { buildTestApp, issueTestToken, resetDb, seedEmployee } from "./helpers"
import { prisma } from "../lib/prisma"

const app = buildTestApp()
let hrToken: string

const validContact = {
    firstName: "Alice",
    lastName: "Mballa",
    relationship: "SIBLING",
    phone: "+237655555555",
    priorityOrder: 1,
    isActive: true
}

const seedContact = async () => {
    return await prisma.emergencyContact.create({
        data: { ...validContact, relationship: "SIBLING", employeeMatricule: "EMP-001" }
    })
}

beforeAll(async () => {
    hrToken = await issueTestToken("TEST-HR-001", "HR")
})

beforeEach(async () => {
    await resetDb()
    await seedEmployee("EMP-001")
})

describe("POST /api/v1/hr/employees/:matricule/emergency-contacts", () => {
    test("200 adds a contact", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/emergency-contacts")
            .set("Authorization", `Bearer ${hrToken}`)
            .send(validContact)
        expect(res.status).toBe(200)
        expect(res.body.firstName).toBe("Alice")
    })

    test("400 on invalid phone", async () => {
        const res = await request(app)
            .post("/api/v1/hr/employees/EMP-001/emergency-contacts")
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ ...validContact, phone: "not-a-phone" })
        expect(res.status).toBe(400)
    })
})

describe("GET /api/v1/hr/employees/:matricule/emergency-contacts", () => {
    test("200 lists the contacts", async () => {
        await seedContact()
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/emergency-contacts")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1)
    })
})

describe("GET /api/v1/hr/employees/:matricule/emergency-contacts/:contactId", () => {
    test("200 returns the contact", async () => {
        const contact = await seedContact()
        const res = await request(app)
            .get(`/api/v1/hr/employees/EMP-001/emergency-contacts/${contact.contactId}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
        expect(res.body.contactId).toBe(contact.contactId)
    })

    test("404 for unknown contact", async () => {
        const res = await request(app)
            .get("/api/v1/hr/employees/EMP-001/emergency-contacts/00000000-0000-0000-0000-000000000000")
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(404)
    })
})

describe("PATCH /api/v1/hr/employees/:matricule/emergency-contacts/:contactId", () => {
    test("200 updates the contact", async () => {
        const contact = await seedContact()
        const res = await request(app)
            .patch(`/api/v1/hr/employees/EMP-001/emergency-contacts/${contact.contactId}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ priorityOrder: 2 })
        expect(res.status).toBe(200)
        expect(res.body.priorityOrder).toBe(2)
    })

    test("400 on bad relationship", async () => {
        const contact = await seedContact()
        const res = await request(app)
            .patch(`/api/v1/hr/employees/EMP-001/emergency-contacts/${contact.contactId}`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ relationship: "NEIGHBOR" })
        expect(res.status).toBe(400)
    })
})

describe("DELETE /api/v1/hr/employees/:matricule/emergency-contacts/:contactId", () => {
    test("200 deletes the contact", async () => {
        const contact = await seedContact()
        const res = await request(app)
            .delete(`/api/v1/hr/employees/EMP-001/emergency-contacts/${contact.contactId}`)
            .set("Authorization", `Bearer ${hrToken}`)
        expect(res.status).toBe(200)
    })
})
