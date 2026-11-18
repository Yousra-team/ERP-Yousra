import type { Request, Response } from "express";
import { archiveEmployeeSchema, createEmployeeSchema, updateEmployeeSchema } from "./employee.schema";
import {prisma} from "../../../lib/prisma";
import * as z from "zod";
import { linkUserToEmployeeSchema } from "../../auth/authSchema";

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

        // matricule is the primary key so it can't be reused
        const existing = await prisma.employee.findUnique({
            where: { employeeMatricule : data.employeeMatricule }
        });

        if(existing) {
            res.status(409).json({message: "An employee with this matricule already exists"})
            return
        }

        // Employee has no user attached yet — HR links one via /link-user
        const employee = await prisma.employee.create({
            data: {
                firstName : data.firstName,
                lastName: data.lastName,
                middleName: data.middleName,
                employeeMatricule: data.employeeMatricule,
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

         // We keep the record; just flag it archived
         // TODO: actually terminate the active contract and end assignments, the message below promises it
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




