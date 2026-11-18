import type { Request, Response } from "express";
import {prisma} from "../../../../lib/prisma";
import * as z from "zod";
import { hashPassword } from '../../../../lib/password';
import { endMarriageSchema, SpouseSchema, updateSpouseSchema } from "./spouse.schema";


export const addSpouse = async (req: Request , res: Response): Promise<void> => {
    try {
    const matricule: string = req.params.matricule as string

    if(!matricule) {
        res.status(400).json({message: "Params error"})
        return
    }

    const employee = await prisma.employee.findUnique({
        where: {
            employeeMatricule : matricule    
        },
        include: {
            spouses: true
        }

    });

    if(!employee) {
        res.status(404).json({message: "Employee not found"})
        return
    }

    // Check if the employee already has an active spouse
    const activeSpouseCount = employee.spouses.filter(s => s.isActive).length

    // Monogamous employees can only have one active spouse at a time
    if(employee.marriageRegime === "MONOGAMOUS" && activeSpouseCount >= 1) {
         res.status(409).json({message: "Employee is monogamous and already has a spouse"})
         return
    }


    const result = SpouseSchema.safeParse(req.body)
     if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
     }

     const data = result.data

     const createMarriage = await prisma.$transaction(async (tx) => {
         const newSpouse = await tx.employeeSpouse.create({
            data: {
                firstName : data.firstName,
                lastName: data.lastName,
                cniNumber: data.cniNumber,
                dateOfBirth: data.dateOfBirth,
                spouseMatricule: data.spouseMatricule, // caller supplies the matricule for now — we'll auto-generate later
                isDependent: data.isDependent,
                marriageDate: data.marriageDate,
                marriageCertificateNo: data.marriageCertificateNo,
                gender: data.gender,
                employeeMatricule: matricule
            }
         })

         const updateEmployee = await tx.employee.update({
            where: {
                employeeMatricule: matricule
            },
            data: {
                maritalStatus: "MARRIED"
            }
         })

         return newSpouse
     });

    res.status(201).json(createMarriage)

    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

// GET ENDPOITNS 
export const getSpouse = async (req: Request , res: Response): Promise<void> => {
    try {
          const matricule: string = req.params.matricule as string
          const spouseMatricule: string = req.params.spouseMatricule as string

          if(!matricule && !spouseMatricule) {
             res.status(400).json({message: "Parameters not found"})
             return
          }

          const employeeSpouse = await prisma.employee.findUnique({
            where: {
                employeeMatricule: matricule,
            },
            include : {spouses: {
                where: {
                    spouseMatricule: spouseMatricule
                }
            }}
          });

          if(!employeeSpouse) {
            res.status(404).json({message:"Could not find Employee or Spouse"})
            console.log("Error in looking for employee or spouse")
            return
          }
          res.status(200).json(employeeSpouse)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const listSpouses = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule = req.params.matricule as string

         if(!matricule) {
            res.status(400).json({message:"Missing Params"})
            return
        }

        const spouses = await prisma.employeeSpouse.findMany({
            where: {
                employeeMatricule : matricule
            }
        })

        res.status(200).json(spouses)
    } catch (error) {
       res.status(500).json({message:"Internal server error"})
       console.log(error) 
    }
};

export const updateSpouse = async (req: Request , res: Response): Promise<void> => {
    try {
         
        const matricule: string = req.params.matricule as string
        const spouseMatricule: string = req.params.spouseMatricule as string

          if(!matricule && !spouseMatricule) {
             res.status(400).json({message: "Parameters not found"})
             return
          }

        const employee = await prisma.employee.findUnique({
            where: {
                employeeMatricule : matricule
            }
        });

        if(!employee) {
            res.status(404).json({message: "Employee not found"})
            return
        }

          const result = updateSpouseSchema.safeParse(req.body)
            if(!result.success) {
             const fieldErrors = z.flattenError(result.error)
             res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
             return
          }
                
        const data = result.data

        const updateSpouse = await prisma.employeeSpouse.update({
            where: {
                spouseMatricule : spouseMatricule,
                employeeMatricule : matricule
            },
            data: {
                ...data
            }
        })

        res.status(200).json(updateSpouse)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const endMarriage = async (req: Request , res: Response): Promise<void> => {
    try {
          const matricule: string = req.params.matricule as string
        const spouseMatricule: string = req.params.spouseMatricule as string

          if(!matricule && !spouseMatricule) {
             res.status(400).json({message: "Parameters not found"})
             return
          }

        const employee = await prisma.employee.findUnique({
            where: {
                employeeMatricule : matricule
                // Maybe we should only end marriage of employees that are not archived
            }
        });

        if(!employee) {
            res.status(404).json({message: "Employee not found"})
            return
        }

        const result = endMarriageSchema.safeParse(req.body)
     if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
     }
                
     const data = result.data

     const spouse = await prisma.employeeSpouse.update({
        where: {
            spouseMatricule : spouseMatricule,
            employeeMatricule : matricule
        },
        data: {
            isActive : false,
            endedOn : data.endedOn,
            endReason: data.endReason
        }
     });
      
     res.status(200).json(spouse)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

/*export const DummyFunction = async (req: Request , res: Response): Promise<void> => {
    try {
        
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};*/
