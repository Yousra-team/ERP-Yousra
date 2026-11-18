import type { Request, Response } from "express";
import { archiveEmployeeSchema, createEmployeeSchema, linkUserSchema, updateEmployeeSchema } from "./employee.schema";
import {prisma} from "../../../lib/prisma";
import { generateEmployeeMatricule } from "./matricule";
import * as z from "zod";

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

        // backend builds the matricule, the client never sends one
        const matricule = await generateEmployeeMatricule(data.hireDate)

        // Employee has no user attached yet — HR links one via /link-user
        const employee = await prisma.employee.create({
            data: {
                firstName : data.firstName,
                lastName: data.lastName,
                middleName: data.middleName,
                employeeMatricule: matricule,
                hireDate: data.hireDate,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender,
                country: data.country,
                cnpsNumber: data.cnpsNumber,
                niuNumber: data.niuNumber,
                email: data.email,
                phone: data.phone,
                residenceAddressLine: data.residenceAddressLine,
                maritalStatus: data.maritalStatus,
                marriageRegime: data.MarriageRegime
            }
        });

   res.status(201).json(employee)
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

         // We keep the record; just flag it archived so normal reads skip it
         const archivedEmployee = await prisma.employee.update({
            where: {
              employeeMatricule : matricule,
            },
            data: {
                isArchived : true,
                departureDate : data.effectiveDate
            }
         })

     res.status(200).json({employee : archivedEmployee , message : "Employee was archived"})
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const restoreEmployee = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule = req.params.matricule as string

        // Reversing archive; contracts and assignments stay as they were
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

        // schema calls it MarriageRegime but the column is marriageRegime, so map it by hand
        // fields left out stay undefined and prisma leaves them untouched
        const { MarriageRegime, ...otherFields } = data

        const updateEmployee = await prisma.employee.update({
            where: {
                employeeMatricule : matricule,
            },
            data: {
                ...otherFields,
                marriageRegime : MarriageRegime
            }
        });

        res.status(200).json(updateEmployee)

    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

// HR links an existing user account to an employee record
export const linkUserToEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
        const matricule: string = req.params.matricule as string

        if(!matricule) {
            res.status(400).json({message: "Invalid Parameters"})
            return
        }

        const result = linkUserSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }
        const data = result.data

        // Employee must exist
        const employee = await prisma.employee.findUnique({ where: { employeeMatricule: matricule } })
        if(!employee) {
            res.status(404).json({message: "Employee not found"})
            return
        }

        // and must not already be linked
        if(employee.userId) {
            res.status(409).json({message: "Employee already linked to a user"})
            return
        }

        // User must exist
        const user = await prisma.user.findUnique({ where: { Id: data.userId } })
        if(!user) {
            res.status(404).json({message: "User not found"})
            return
        }

        // and must not already be linked to another employee
        const existingLink = await prisma.employee.findUnique({ where: { userId: data.userId } })
        if(existingLink) {
            res.status(409).json({message: "User is already linked to another employee"})
            return
        }

        const updated = await prisma.employee.update({
            where: { employeeMatricule: matricule },
            data: { userId: data.userId }
        })

        res.status(200).json(updated)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
}

// Unlink when the person leaves but their user account stays
export const unlinkUserFromEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
        const matricule: string = req.params.matricule as string

        if(!matricule) {
            res.status(400).json({message: "Invalid Parameters"})
            return
        }

        const employee = await prisma.employee.findUnique({ where: { employeeMatricule: matricule } })
        if(!employee) {
            res.status(404).json({message: "Employee not found"})
            return
        }

        const updated = await prisma.employee.update({
            where: { employeeMatricule: matricule },
            data: { userId: null }
        })

        res.status(200).json(updated)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
}




