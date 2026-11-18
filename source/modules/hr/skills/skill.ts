import type { Request, Response } from "express";
import {prisma} from "../../../lib/prisma";
import * as z from "zod";
import { skillSchema, updateSkillSchema } from "./skillSchema";

export const createSkill = async (req: Request , res: Response): Promise<void> => {
    try {
        const result = skillSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        const skill = await prisma.skill.create({
            data: {
                ...data
            }
        });

        res.status(201).json(skill)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getSkills = async (req: Request , res: Response): Promise<void> => {
    try {
        const skills = await prisma.skill.findMany();
        res.status(200).json(skills)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getSkill = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string

        if(!id) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const skill = await prisma.skill.findUnique({
            where: {
                id : id
            }
        });

        if(!skill) {
            res.status(404).json({message:"Skill not found"})
            return
        }

        res.status(200).json(skill)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const updateSkill = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string

        if(!id) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const result = updateSkillSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        const skill = await prisma.skill.update({
            where: {
                id : id
            },
            data: {
                ...data
            }
        });

        res.status(200).json(skill)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const deleteSkill = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string

        if(!id) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const skill = await prisma.skill.delete({
            where: {
                id : id
            }
        });

        res.status(200).json(skill)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};
