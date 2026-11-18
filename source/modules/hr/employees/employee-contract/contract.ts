import type { Request, Response } from "express";
import {prisma} from "../../../../lib/prisma";
import { nextRecordId } from "../matricule";
import * as z from "zod";
import { createContractSchema, terminateContractSchema, updateContractSchema } from "./contractSchema";


export const createContract = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule : string = req.params.matricule as string

        if(!matricule){
            res.status(400).json({message: "Invalid Parameters"})
            return
        }

        const result = createContractSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        // EMP-2024-08-001-CT1, CT2 ...
        const existing = await prisma.contract.findMany({
            where: { employeeMatricule : matricule },
            select: { contractId : true }
        })
        const contractId = nextRecordId(matricule, "CT", existing.map(c => c.contractId))

        const newContract = await prisma.contract.create({
            data: {
                ...data,
                contractId : contractId,
                employeeMatricule : matricule
            }
        });

        res.status(201).json(newContract)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const listContracts = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule : string = req.params.matricule as string

        if(!matricule){
            res.status(400).json({message: "Invalid Parameters"})
            return
        }

        const contracts = await prisma.contract.findMany({
            where: {
                employeeMatricule : matricule
            }
        });

        res.status(200).json(contracts)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getContract = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule : string = req.params.matricule as string
        const contractId : string = req.params.contractId as string

        if(!matricule && !contractId){
            res.status(400).json({message: "Invalid Parameters"})
            return
        }

        const contract = await prisma.contract.findUnique({
            where: {
                contractId : contractId,
                employeeMatricule : matricule
            }
        });

        if(!contract) {
            res.status(404).json({message: "Contract not found"})
            return
        }

        res.status(200).json(contract)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const updateContract = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule : string = req.params.matricule as string
        const contractId : string = req.params.contractId as string

        if(!matricule && !contractId){
            res.status(400).json({message: "Invalid Parameters"})
            return
        }

        const result = updateContractSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        const contract = await prisma.contract.update({
            where: {
                contractId : contractId,
                employeeMatricule : matricule
            },
            data: {
                ...data
            }
        });

        res.status(200).json(contract)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const terminateContract = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule : string = req.params.matricule as string
        const contractId : string = req.params.contractId as string

        if(!matricule && !contractId){
            res.status(400).json({message: "Invalid Parameters"})
            return
        }

        const result = terminateContractSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        const contract = await prisma.contract.update({
            where: {
                contractId : contractId,
                employeeMatricule : matricule
            },
            data: {
                terminationDate : data.terminationDate,
                terminationReason : data.terminationReason
            }
        });

        res.status(200).json(contract)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};
