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
