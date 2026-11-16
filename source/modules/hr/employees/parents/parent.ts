import type { Request, Response } from "express";
import {prisma} from "../../../../lib/prisma";
import * as z from "zod";
import { employeeParentSchema, updateParentSchema } from "./parentSchema";

export const addParent = async (req: Request , res: Response): Promise<void> => {
    try {
         const matricule : string = req.params.matricule as string

         if(!matricule){
            res.status(400).json({message: "Invalid Parameters"})
            return
         }
      const result = employeeParentSchema.safeParse(req.body)
        if(!result.success) {
          const fieldErrors = z.flattenError(result.error)
          res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
          return
       }
              
     const data = result.data

     const newParent = await prisma.employeeParent.create({
        data : {
            ...data,
            employeeMatricule : matricule
        }
     });

     res.status(201).json(newParent)

    } catch (error) {
      res.status(500).json({message: "Internal Server Error when adding Parent" , error: error})
      console.log(error)
    }
};

export const getParents = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule : string = req.params.matricule as string

         if(!matricule){
            res.status(400).json({message: "Invalid Parameters"})
            return
         }

         const parents = await prisma.employee.findUnique({
            where: {
                employeeMatricule : matricule,
                isArchived : false
            },
            select : {parents : true}
         });

         res.status(200).json(parents)
        
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when getting Parents" , error: error})
      console.log(error)
    }
};

export const getParent = async (req: Request , res: Response): Promise<void> => {
    try {
         const matricule : string = req.params.matricule as string
         const parentMatricule : string = req.params.parentMatricule as string

         if(!matricule && !parentMatricule){
            res.status(400).json({message: "Invalid Parameters"})
            return
         }
        const parent = await prisma.employeeParent.findUnique({
            where: {
                parentMatricule : parentMatricule,
                employeeMatricule : matricule
            }
        });

          if(!parent) {
            res.status(404).json({message: "Parent not found"})
            return
          }

          res.status(200).json(parent)

    } catch (error) {
      res.status(500).json({message: "Internal Server Error when getting Parent" , error: error})
      console.log(error) 
    }
};

export const updateParent = async (req: Request , res: Response): Promise<void> => {
    try {
         const matricule : string = req.params.matricule as string
         const parentMatricule : string = req.params.parentMatricule as string

         if(!matricule && !parentMatricule){
            res.status(400).json({message: "Invalid Parameters"})
            return
         }
         
     const result = updateParentSchema.safeParse(req.body)
        if(!result.success) {
          const fieldErrors = z.flattenError(result.error)
          res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
          return
       }

       const data = result.data;

         const parent = await prisma.employeeParent.update({
            where: {
                parentMatricule : parentMatricule,
                employeeMatricule : matricule
            },
            data: {
                ...data
            }
        });

      res.status(200).json(parent)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when updating Parent" , error: error})
      console.log(error)   
    }
};

export const deleteParent = async (req: Request , res: Response): Promise<void> => {
    try {
         const matricule : string = req.params.matricule as string
         const parentMatricule : string = req.params.parentMatricule as string

         if(!matricule && !parentMatricule){
            res.status(400).json({message: "Invalid Parameters"})
            return
         }
         
     
         const parent = await prisma.employeeParent.delete({
            where: {
                parentMatricule : parentMatricule,
                employeeMatricule : matricule
            },
        });

      res.status(200).json(parent)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when deleting Parent" , error: error})
      console.log(error)   
    }
};
