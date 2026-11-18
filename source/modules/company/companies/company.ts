import type { Request, Response } from "express";
import {prisma} from "../../../lib/prisma";
import * as z from "zod";
import { companySchema, updateCompanySchema } from "./companySchema";

export const createCompany = async (req: Request , res: Response): Promise<void> => {
    try {
        const result = companySchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        const company = await prisma.company.create({
            data: {
                ...data
            }
        });

        res.status(201).json(company)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getCompanies = async (req: Request , res: Response): Promise<void> => {
    try {
        const companies = await prisma.company.findMany();
        res.status(200).json(companies)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getCompany = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string

        if(!id) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const company = await prisma.company.findUnique({
            where: {
                id : id
            }
        });

        if(!company) {
            res.status(404).json({message:"Company not found"})
            return
        }

        res.status(200).json(company)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const updateCompany = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string

        if(!id) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const result = updateCompanySchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        const company = await prisma.company.update({
            where: {
                id : id
            },
            data: {
                ...data
            }
        });

        res.status(200).json(company)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const deleteCompany = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.id as string

        if(!id) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const company = await prisma.company.delete({
            where: {
                id : id
            }
        });

        res.status(200).json(company)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};
