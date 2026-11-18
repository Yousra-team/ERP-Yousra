import type { Request, Response } from "express";
import {prisma} from "../../../lib/prisma";
import * as z from "zod";
import { positionSchema, updatePositionSchema } from "./positionSchema";

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

export const listPositions = async (req: Request , res: Response): Promise<void> => {
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

// positions that report directly to this one
export const listSubordinates = async (req: Request , res: Response): Promise<void> => {
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

// employees holding this position right now, an assignment with no endDate is still active
export const listHolders = async (req: Request , res: Response): Promise<void> => {
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

        // a position can't supervise itself
        // TODO: cycle and cross-service check later
        if(data.supervisorId === id) {
            res.status(400).json({message:"A position can not supervise itself"})
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
