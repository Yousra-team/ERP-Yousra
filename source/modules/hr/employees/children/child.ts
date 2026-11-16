import type { Request, Response } from "express";
import {prisma} from "../../../../lib/prisma";
import { childSchema, updateChildSchema } from "./childSchema";
import * as z from "zod";

export const listChildren = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule = req.params.matricule as string

        if(!matricule) {
          res.status(400).json({message:"Invalid Parameters"})
          return
        }

        const employeeChildren = await prisma.employee.findUnique({
            where: {
                employeeMatricule : matricule,
                isArchived : false
            },
            select : {children : true}
        });

        res.status(200).json({message: "Found Children" , babies : employeeChildren})
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getAChild = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule: string = req.params.matricule as string
        const childMatricule: string = req.params.childMatricule as string

          if(!matricule && !childMatricule) {
             res.status(400).json({message: "Parameters not found"})
             return
          }
        
        const child = await prisma.employeeChild.findUnique({
             where: {
                childMatricule : childMatricule,
                employeeMatricule : matricule
             }
        })

        res.status(200).json(child)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const addChild = async (req: Request , res: Response): Promise<void> => {
    try {
         const matricule = req.params.matricule as string

         if(!matricule) {
            res.status(400).json({message: "Parameters not found"})
            return
         }

      const result = childSchema.safeParse(req.body)
            if(!result.success) {
                const fieldErrors = z.flattenError(result.error)
                res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
                return
            }
                          
        const data = result.data
        const child = await prisma.employeeChild.create({
            data: {
                ...data,
                employeeMatricule : matricule
            }
        })
        res.status(201).json(child)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const updateChild = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule: string = req.params.matricule as string
        const childMatricule: string = req.params.childMatricule as string

          if(!matricule && !childMatricule) {
             res.status(400).json({message: "Parameters not found"})
             return
          }
       
          const result = updateChildSchema.safeParse(req.body)
            if(!result.success) {
                const fieldErrors = z.flattenError(result.error)
                res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
                return
            }
                          
          const data = result.data
        
          const updatedChild = await prisma.employeeChild.update({
            where : {
                childMatricule: childMatricule,
                employeeMatricule : matricule
            },
             data: {
                ...data
             }
          })
           res.status(200).json(updatedChild)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};


export const deleteChild = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule: string = req.params.matricule as string
        const childMatricule: string = req.params.childMatricule as string

          if(!matricule && !childMatricule) {
             res.status(400).json({message: "Parameters not found"})
             return
          }

          await prisma.employeeChild.delete({
            where: {
                childMatricule : childMatricule,
                employeeMatricule : matricule
            },
          });
     res.status(200).json({message: "Deleted"})
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};




