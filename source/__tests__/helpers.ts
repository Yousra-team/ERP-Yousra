import app from "../app"
import { prisma } from "../lib/prisma"
import { signAccessToken } from "../lib/jwt"

// The same app the server runs — tests hit it through supertest
export const buildTestApp = () => {
    return app
}

export const issueTestToken = async (userId: string, role: string): Promise<string> => {
    return await signAccessToken({ userId, role })
}

// Deletes every row between tests, children first so foreign keys never block
export const resetDb = async (): Promise<void> => {
    await prisma.$transaction([
        prisma.employeeChild.deleteMany(),
        prisma.employeeSpouse.deleteMany(),
        prisma.employeeParent.deleteMany(),
        prisma.emergencyContact.deleteMany(),
        prisma.academicCredential.deleteMany(),
        prisma.employeeSkill.deleteMany(),
        prisma.positionSkill.deleteMany(),
        prisma.employeePosition.deleteMany(),
        prisma.contract.deleteMany(),
        prisma.employee.deleteMany(),
        prisma.user.deleteMany(),
        prisma.position.deleteMany(),
        prisma.department.deleteMany(),
        prisma.company.deleteMany(),
        prisma.skill.deleteMany(),
    ])
}

// ---- Seeds (written straight through prisma so tests do not depend on the endpoints) ----

export const seedEmployee = async (matricule: string, overrides: object = {}) => {
    return await prisma.employee.create({
        data: {
            employeeMatricule: matricule,
            firstName: "Test",
            lastName: "Employee",
            gender: "male",
            dateOfBirth: new Date("1990-01-01"),
            hireDate: new Date("2020-01-01"),
            country: "Cameroon",
            maritalStatus: "SINGLE",
            marriageRegime: "MONOGAMOUS",
            ...overrides
        }
    })
}

export const seedSpouse = async (employeeMatricule: string, spouseMatricule: string) => {
    return await prisma.employeeSpouse.create({
        data: {
            spouseMatricule: spouseMatricule,
            employeeMatricule: employeeMatricule,
            firstName: "Test",
            lastName: "Spouse",
            dateOfBirth: new Date("1992-01-01"),
            gender: "female",
            cniNumber: `CNI-${spouseMatricule}`,
            marriageDate: new Date("2015-01-01"),
            isDependent: true
        }
    })
}

export const seedSkill = async (name: string = "Accounting") => {
    return await prisma.skill.create({
        data: {
            name: name,
            category: "TECHNICAL"
        }
    })
}

// Company -> Department -> Position in one call, for everything that needs an org chart
export const seedOrgStructure = async () => {
    const company = await prisma.company.create({
        data: {
            name: "Yousra",
            creationDate: new Date("2010-01-01"),
            isParent: true
        }
    })
    const department = await prisma.department.create({
        data: {
            companyId: company.id,
            name: "Finance",
            description: "Finance department",
            isActive: true
        }
    })
    const position = await prisma.position.create({
        data: {
            title: "Accountant",
            description: "Keeps the books",
            departmentId: department.departmentId
        }
    })
    return { company, department, position }
}
