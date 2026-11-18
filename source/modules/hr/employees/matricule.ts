import {prisma} from "../../../lib/prisma";

// EMP-2024-08-001 → hire year-month + creation order
// the number follows the order employees are created in, not the hire date
export const generateEmployeeMatricule = async (hireDate: Date): Promise<string> => {
    const lastEmployee = await prisma.employee.findFirst({
        orderBy: { createdAt: "desc" }
    });

    // last part of the previous matricule + 1, first employee gets 1
    let nextNumber = 1
    if(lastEmployee) {
        const parts = lastEmployee.employeeMatricule.split("-")
        nextNumber = Number(parts[parts.length - 1]) + 1
    }

    const year = hireDate.getUTCFullYear()
    const month = String(hireDate.getUTCMonth() + 1).padStart(2, "0")
    const number = String(nextNumber).padStart(3, "0")

    return `EMP-${year}-${month}-${number}`
};

// ids for records that belong to an employee: spouses S, children C, parents P,
// emergency contacts EC, academic credentials AC, contracts CT
// EMP-2024-08-001 + "S" → EMP-2024-08-001-S1, then S2 ...
// highest number used so far + 1, so a gap left by a delete is never refilled
export const nextRecordId = (employeeMatricule: string, letter: string, existingIds: string[]): string => {
    const prefix = `${employeeMatricule}-${letter}`

    let highest = 0
    for (const id of existingIds) {
        // old uuid ids give NaN and are skipped
        const number = Number(id.slice(prefix.length))
        if(id.startsWith(prefix) && number > highest) {
            highest = number
        }
    }

    return `${prefix}${highest + 1}`
};
