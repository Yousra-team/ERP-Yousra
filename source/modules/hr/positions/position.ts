import type { Request, Response } from "express";
import {prisma} from "../../../lib/prisma";
import * as z from "zod";
import { positionSchema, positionSkillSchema, updatePositionSchema, updatePositionSkillSchema } from "./positionSchema";

export const createPosition = async (req: Request , res: Response): Promise<void> => {
    try {
        const result = positionSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        const position = await prisma.position.create({
            data: {
                ...data
            }
        });

        res.status(201).json(position)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getPositions = async (req: Request , res: Response): Promise<void> => {
    try {
        const positions = await prisma.position.findMany();
        res.status(200).json(positions)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getPosition = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string

        if(!id) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const position = await prisma.position.findUnique({
            where: {
                id : id
            }
        });

        if(!position) {
            res.status(404).json({message:"Position not found"})
            return
        }

        res.status(200).json(position)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getSubordinates = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string

        if(!id) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const subordinates = await prisma.position.findMany({
            where: {
                supervisorId : id
            }
        });

        res.status(200).json(subordinates)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

// Holders = employees currently assigned to this position
export const getHolders = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string

        if(!id) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const holders = await prisma.employeePosition.findMany({
            where: {
                positionId : id,
                endDate : null
            },
            include: {
                employee : true
            }
        });

        res.status(200).json(holders)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const updatePosition = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string

        if(!id) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const result = updatePositionSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        // A position can not be its own supervisor
        // TODO: cycle / cross-department check
        if(data.supervisorId === id) {
            res.status(409).json({message:"A position can not supervise itself"})
            return
        }

        const position = await prisma.position.update({
            where: {
                id : id
            },
            data: {
                ...data
            }
        });

        res.status(200).json(position)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const deletePosition = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string

        if(!id) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const position = await prisma.position.delete({
            where: {
                id : id
            }
        });

        res.status(200).json(position)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

// ---- Position skills (requirements of the position, not of an employee) ----

export const getPositionSkills = async (req: Request , res: Response): Promise<void> => {
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

export const deletePositionSkill = async (req: Request , res: Response): Promise<void> => {
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
