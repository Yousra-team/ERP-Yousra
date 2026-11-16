import type { Request, Response } from "express";
import {prisma} from "../../../../lib/prisma";
import * as z from "zod";
import { employeeSkillSchema, updateSkillSchema } from "./skillSchema";

export const addSkill = async (req: Request , res: Response): Promise<void> => {
    try {
   const matricule : string = req.params.matricule as string
 
        if(!matricule){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }
       const result = employeeSkillSchema.safeParse(req.body)
         if(!result.success) {
           const fieldErrors = z.flattenError(result.error)
           res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
           return
        }
               
      const data = result.data

      const newSkill = await prisma.employeeSkill.create({
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


export const updateSkill = async (req: Request , res: Response): Promise<void> => {
    try {
   const matricule : string = req.params.matricule as string
   const skillId : string = req.params.skillId as string
 
        if(!matricule && !skillId){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }
       const result = updateSkillSchema.safeParse(req.body)
         if(!result.success) {
           const fieldErrors = z.flattenError(result.error)
           res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
           return
        }
               
      const data = result.data

      const newSkill = await prisma.employeeSkill.update({
        where: {
           employeeMatricule_skillId: {
            employeeMatricule : matricule,
            skillId : skillId
           }
        },
        data: {
            ...data,
        }
      });

      res.status(200).json(newSkill)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when Updating Skill" , error: error})
      console.log(error)
    }
};

export const getSkill = async (req: Request , res: Response): Promise<void> => {
    try {
         const matricule : string = req.params.matricule as string
         const skillId : string = req.params.skillId as string
 
        if(!matricule && !skillId){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }

        const skill = await prisma.employeeSkill.findUnique({
            where: {
                employeeMatricule_skillId: {
                    employeeMatricule : matricule,
                    skillId : skillId
                }
            }
        });

        res.status(200).json(skill)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when fetching Skill" , error: error})
      console.log(error) 
    }
};

export const getSkills = async (req: Request , res: Response): Promise<void> => {
    try {
         const matricule : string = req.params.matricule as string
        
        if(!matricule){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }

        const skills = await prisma.employeeSkill.findMany({
            where: {
                employeeMatricule : matricule
            }
        });

        res.status(200).json(skills)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when fetching Skills" , error: error})
      console.log(error) 
    }
};

export const deleteSkill = async (req: Request , res: Response): Promise<void> => {
    try {
         const matricule : string = req.params.matricule as string
         const skillId : string = req.params.skillId as string
 
        if(!matricule && !skillId){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }

        const skill = await prisma.employeeSkill.delete({
            where: {
                employeeMatricule_skillId: {
                    employeeMatricule : matricule,
                    skillId : skillId
                }
            }
        });

        res.status(200).json(skill)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when removing Skill" , error: error})
      console.log(error) 
    }
};