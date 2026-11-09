import { Request, Response } from "express";
import {prisma} from "../../../../lib/prisma";
import * as z from "zod";
import { hashPassword } from '../../../../lib/password';
import { SpouseSchema, updateSpouseSchema } from "./spouse.schema";

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

    if(employee.marriageRegime == "MONOGAMOUS"  && employee.spouses) {
         res.status(409).json({message: "The Employee is monogamous can not add a spouse"})
         return
    }


    const result = SpouseSchema.safeParse(req.body)
     if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
     }
                
     const data = result.data

     const createMarriage = prisma.$transaction(async (tx) => {
         const newSpouse = await tx.employeeSpouse.create({
            data: {
                firstName : data.firstName,
                lastName: data.lastName,
                cniNumber: data.cniNumber,
                dateOfBirth: data.dateOfBirth,
                spouseMatricule: "DEFAULT", // change later,
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


     });

    res.status(200).json(createMarriage)

    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

// GET ENDPOITNS 
export const getSpouse = async (req: Request , res: Response): Promise<void> => {
    try {
          const matricule: string = req.params.matricule as string
          const spouseMatricule: string = req.params.matricule as string

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

        const spouses = await prisma.employee.findUnique({
            where: {
                isArchived : false,
                employeeMatricule : matricule
            },
            include: { spouses : true}
        })

    } catch (error) {
       res.status(500).json({message:"Internal server error"})
       console.log(error) 
    }
};

export const updateSpouse = async (req: Request , res: Response): Promise<void> => {
    try {
         
        const matricule: string = req.params.matricule as string
        const spouseMatricule: string = req.params.matricule as string

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

        const updateSpouse = await prisma.employee.


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
