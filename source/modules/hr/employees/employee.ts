import type { Request, Response } from "express";
import { archiveEmployeeSchema, createEmployeeSchema, updateEmployeeSchema } from "./employee.schema";
import {prisma} from "../../../lib/prisma";
import * as z from "zod";
import { hashPassword } from '../../../lib/password';

// CREATE AN EMPLOYEE
export const createEmployee = async (req: Request , res: Response): Promise<void> => {
    try {
        const result = createEmployeeSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }
        
        const data = result.data

        const hashedPassword: string = await hashPassword(data.user.password)

        // One transaction: if the user creation fails the employee is rolled back too
        const createEmployeeAndUser = await prisma.$transaction(async(tx) => {
        // The user comes first so the employee can store its id (userId link)
        const user = await tx.user.create({
            data: {
                username: data.employeeMatricule, // Employees log in with their matricule
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.user.role,
                password: hashedPassword
            },
        });

        const employee = await tx.employee.create({
            data: {
                firstName : data.firstName,
                lastName: data.lastName,
                middleName: data.middleName,
                employeeMatricule: data.employeeMatricule,
                userId: user.Id,
                hireDate: data.hireDate,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender,
                country: data.country,
                cnpsNumber: data.cnpsNumber,
                niuNumber: data.niuNumber,
                email: data.email,
                phone: data.phone,
                residenceAddressLine: data.residenceAddressLine,
                maritalStatus: data.maritalStatus
            }
        });

        return employee
    })
   res.status(201).json(createEmployeeAndUser)
    } catch (error) {
        res.status(500).json({message:"Internal server or database error"})
        console.log(error)
    }
};

//GET ALL EMPLOYEES
export const getEmployees = async (req: Request , res: Response): Promise<void> => {
    try {
        // We need to build dynamic Queries here later
        const employees = await prisma.employee.findMany({
            where: {isArchived: false}
        });
        res.status(200).json(employees)
    } catch (error) {
        res.status(500).json({message:"Internal server or database error"})
        console.log(error) 
    }
};

export const getAnEmployee = async (req: Request , res: Response): Promise<void> => {
    try {
          const matricule : string = req.params.matricule as string

          if(!matricule) {
            res.status(400).json({message:"Wrong Parameters"})
            return
          }

          const employee = await prisma.employee.findUnique({
            where: {
                employeeMatricule : matricule,
                isArchived: false
            },
          });

          if(!employee) {
            res.status(404).json({message:"Resource not found"})
            return
          }

          res.status(200).json(employee)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};



export const archiveEmployee = async (req: Request , res: Response): Promise<void> => {
    try {
         const matricule = req.params.matricule as string

         if(!matricule) {
            res.status(400).json({message:"This is a params error"})
            return
         }

         const result = archiveEmployeeSchema.safeParse(req.body)
         if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message: "Bad data" , error: fieldErrors.fieldErrors})
            return
         }

         const data = result.data

         const archivedEmployee = await prisma.employee.update({
            where: {
              employeeMatricule : matricule,
            },
            data: {
                isArchived : true,
                departureDate : data.effectiveDate
            }
         })

     res.status(200).json({employee : archivedEmployee , message : "Employee was archived; 1 contract terminated , 1 assignment ended"})
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const restoreEmployee = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule = req.params.matricule as string

        const restoredEmployee = await prisma.employee.update({
            where: {
                employeeMatricule : matricule,
                isArchived : true
            },
            data: {
                isArchived : false,
                departureDate : null
            }
        });

        res.status(200).json({employee: restoredEmployee , message: "Was Successfully Restored 1 employee"})
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};


export const listArchivedEmployees = async (req: Request , res: Response): Promise<void> => {
    try {
         const archivedEmployees = await prisma.employee.findMany({
            where: {isArchived : true}
         })
         res.status(200).json(archivedEmployees)
    } catch (error) {
         res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getArchivedEmployee = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule = req.params.matricule as string

        if(!matricule) {
            res.status(400).json({message:"Missing Params"})
            return
        }

        const employee = await prisma.employee.findUnique({
            where: {
                employeeMatricule: matricule,
                isArchived : true
            }
        });

        if(!employee) {
            res.status(404).json({message:"Resource not found"})
            return
        }

        res.status(200).json(employee)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};


export const updateEmployee = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule = req.params.matricule as string

        if(!matricule) {
            res.status(400).json({message:"Missing Params"})
            return
        }

        const result = updateEmployeeSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }
        
        const data = result.data

        const updateEmployee = await prisma.employee.update({
            where: {
                employeeMatricule : matricule,
            },
            data: {
                ...data
            }
        });

        res.status(200).json(updateEmployee)

    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};




