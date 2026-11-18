import type { Request, Response } from "express";
import {prisma} from "../../../lib/prisma";

// read only, writes go through /api/v1/hr/employees/:matricule/contracts

export const listAllContracts = async (req: Request , res: Response): Promise<void> => {
    try {
        const contracts = await prisma.contract.findMany();
        res.status(200).json(contracts)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

// fixed term contracts (CDD, STAGE, TEMPORAIRE) ending in the next 60 days
export const listExpiringContracts = async (req: Request , res: Response): Promise<void> => {
    try {
        const today = new Date()
        const limitDate = new Date()
        limitDate.setDate(today.getDate() + 60)

        const contracts = await prisma.contract.findMany({
            where: {
                contractType : { in: ["CDD", "STAGE", "TEMPORAIRE"] },
                endDate : {
                    gte : today,
                    lte : limitDate
                }
            }
        });

        res.status(200).json(contracts)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getContractById = async (req: Request , res: Response): Promise<void> => {
    try {
        const contractId = req.params.contractId as string

        if(!contractId) {
            res.status(400).json({message:"Invalid Parameters"})
            return
        }

        const contract = await prisma.contract.findUnique({
            where: {
                contractId : contractId
            }
        });

        if(!contract) {
            res.status(404).json({message:"Contract not found"})
            return
        }

        res.status(200).json(contract)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};
