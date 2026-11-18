import type { Request, Response } from "express";
import {prisma} from "../../../../lib/prisma";
import * as z from "zod";
import { positionSkillSchema, updatePositionSkillSchema } from "./positionSkillSchema";

// skills a position requires, not the skills an employee has (that's employee-skills)

export const listPositionSkills = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string

        if(!id) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const skills = await prisma.positionSkill.findMany({
            where: {
                positionId : id
            }
        });

        res.status(200).json(skills)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const addPositionSkill = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string

        if(!id) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const result = positionSkillSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        const positionSkill = await prisma.positionSkill.create({
            data: {
                ...data,
                positionId : id
            }
        });

        res.status(201).json(positionSkill)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const updatePositionSkill = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string
        const skillId = req.params.skillId as string

        if(!id && !skillId) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const result = updatePositionSkillSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        // the table has no id column, a row is the pair (position, skill)
        const positionSkill = await prisma.positionSkill.update({
            where: {
                positionId_skillId: {
                    positionId : id,
                    skillId : skillId
                }
            },
            data: {
                ...data
            }
        });

        res.status(200).json(positionSkill)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const removePositionSkill = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string
        const skillId = req.params.skillId as string

        if(!id && !skillId) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const positionSkill = await prisma.positionSkill.delete({
            where: {
                positionId_skillId: {
                    positionId : id,
                    skillId : skillId
                }
            }
        });

        res.status(200).json(positionSkill)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};
