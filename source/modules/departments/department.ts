import type { Request, Response } from "express";
import {prisma} from "../../lib/prisma";
import * as z from "zod";
import { departmentSchema, updateDepartmentSchema } from "./departmentSchema";

export const createDepartment = async (req: Request , res: Response): Promise<void> => {
    try {
        const result = departmentSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        const department = await prisma.department.create({
            data: {
                ...data
            }
        });

        res.status(201).json(department)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getDepartments = async (req: Request , res: Response): Promise<void> => {
    try {
        const departments = await prisma.department.findMany();
        res.status(200).json(departments)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getDepartment = async (req: Request , res: Response): Promise<void> => {
    try {
        const departmentId = req.params.departmentId as string

        if(!departmentId) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const department = await prisma.department.findUnique({
            where: {
                departmentId : departmentId
            }
        });

        if(!department) {
            res.status(404).json({message:"Department not found"})
            return
        }

        res.status(200).json(department)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getChildDepartments = async (req: Request , res: Response): Promise<void> => {
    try {
        const departmentId = req.params.departmentId as string

        if(!departmentId) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const children = await prisma.department.findMany({
            where: {
                parentDepartmentId : departmentId
            }
        });

        res.status(200).json(children)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const updateDepartment = async (req: Request , res: Response): Promise<void> => {
    try {
        const departmentId = req.params.departmentId as string

        if(!departmentId) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const result = updateDepartmentSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        const department = await prisma.department.update({
            where: {
                departmentId : departmentId
            },
            data: {
                ...data
            }
        });

        res.status(200).json(department)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const deleteDepartment = async (req: Request , res: Response): Promise<void> => {
    try {
        const departmentId = req.params.departmentId as string

        if(!departmentId) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const department = await prisma.department.delete({
            where: {
                departmentId : departmentId
            }
        });

        res.status(200).json(department)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};
