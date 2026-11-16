import type { Request, Response } from "express";
import {prisma} from "../../../../lib/prisma";
import * as z from "zod";
import { employeePositionSchema, endAssignment, updatePositionSchema } from "./positionSchema";


export const addPosition = async (req: Request , res: Response): Promise<void> => {
    try {
   const matricule : string = req.params.matricule as string
 
        if(!matricule){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }
       const result = employeePositionSchema.safeParse(req.body)
         if(!result.success) {
           const fieldErrors = z.flattenError(result.error)
           res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
           return
        }
               
      const data = result.data

      const newSkill = await prisma.employeePosition.create({
        data: {
            ...data,
            employeeMatricule : matricule
        }
      });

      res.status(200).json(newSkill)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when adding employee skill" , error: error})
      console.log(error)
    }
};


export const updatePosition = async (req: Request , res: Response): Promise<void> => {
    try {
   const matricule : string = req.params.matricule as string
   const assignmentId : string = req.params.assignmentId as string
 
        if(!matricule && !assignmentId){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }
       const result = updatePositionSchema.safeParse(req.body)
         if(!result.success) {
           const fieldErrors = z.flattenError(result.error)
           res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
           return
        }
               
      const data = result.data

      const newPosition = await prisma.employeePosition.update({
        where: {
           assignmentId: assignmentId
        },
        data: {
            ...data,
        }
      });

      res.status(200).json(newPosition)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when Updating Skill" , error: error})
      console.log(error)
    }
};

export const getPosition = async (req: Request , res: Response): Promise<void> => {
    try {
         const matricule : string = req.params.matricule as string
         const assignmentId : string = req.params.assignmentId as string

        if(!matricule && !assignmentId){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }

        const position = await prisma.employeePosition.findUnique({
            where: {
             assignmentId : assignmentId,
             employeeMatricule: matricule
            }
        });

        if(!position) {
            res.status(404).json({message: "Assignment not found"})
            return
        }

        res.status(200).json(position)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when fetching Skill" , error: error})
      console.log(error) 
    }
};

export const getPositions = async (req: Request , res: Response): Promise<void> => {
    try {
         const matricule : string = req.params.matricule as string
        
        if(!matricule){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }

        const positions = await prisma.employeePosition.findMany({
            where: {
                employeeMatricule : matricule
            }
        });

        res.status(200).json(positions)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when fetching positions" , error: error})
      console.log(error) 
    }
};

export const EndPosition = async (req: Request , res: Response): Promise<void> => {
    try {
         const matricule : string = req.params.matricule as string
         const assignmentId : string = req.params.assignmentId as string

        if(!matricule && !assignmentId){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }

        const result = endAssignment.safeParse(req.body)

        if(!result.success) {
           const fieldErrors = z.flattenError(result.error)
           res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
           return
        }

        const data = result.data

        const position = await prisma.employeePosition.update({
            where: {
               assignmentId : assignmentId,
               employeeMatricule : matricule
            },
            data: {
               endDate : data.endDate
            }
        });

        res.status(200).json(position)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when removing Skill" , error: error})
      console.log(error) 
    }
};