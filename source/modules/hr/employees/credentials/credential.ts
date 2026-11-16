import type { Request, Response } from "express";
import {prisma} from "../../../../lib/prisma";
import * as z from "zod";
import { academicCredentialSchema, updateCredentialSchema } from "./credentialSchema";

export const addCredential = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule : string = req.params.matricule as string

        if(!matricule) {
          res.status(400).json({message:"Errors in Parameters"})
          return
        }

        const result = academicCredentialSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data
        
        const newCredential = await prisma.academicCredential.create({
            data: {
                ...data,
            }
        });
     
        res.status(201).json(newCredential)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getCredential = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule : string = req.params.matricule as string
        const id: string = req.params.id as string

         if(!matricule && !id) {
          res.status(400).json({message:"Errors in Parameters"})
          return
        }
        
        const credential = await prisma.academicCredential.findUnique({
            where: {
                employeeMatricule : matricule,
                id : id
            }
        });

        if(!credential) {
            res.status(404).json({message:"Credential not found"})
            return
        }

        res.status(200).json(credential)
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
        console.log(error)
    }
};

export const getCredentials = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule : string = req.params.matricule as string

         if(!matricule) {
          res.status(400).json({message:"Errors in Parameters"})
          return
        }

        const credentials = await prisma.academicCredential.findMany({
            where: {
                employeeMatricule : matricule
            }
        });

        res.status(200).json(credentials)
    } catch (error) {
       res.status(500).json({message:"Internal server error"})
       console.log(error)  
    }
};

export const updateCredential = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule : string = req.params.matricule as string
        const id: string = req.params.id as string

         if(!matricule && !id) {
          res.status(400).json({message:"Errors in Parameters"})
          return
        }
     
        const result = updateCredentialSchema.safeParse(req.body)
        if(!result.success) {
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        const credential = await prisma.academicCredential.update({
            where: {
                employeeMatricule : matricule,
                id : id
            },
            data:{
             ...data
            },
        });
      res.status(200).json(credential)
    } catch (error) {
      res.status(500).json({message:"Internal server error"})
      console.log(error)  
    }
};


export const deleteCredential = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule : string = req.params.matricule as string
        const id: string = req.params.id as string

         if(!matricule && !id) {
          res.status(400).json({message:"Errors in Parameters"})
          return
        }

        const credential = await prisma.academicCredential.delete({
            where: {
                employeeMatricule : matricule,
                id : id
            }
        });

        res.status(200).json(credential)
    } catch (error) {
       res.status(500).json({message:"Internal server error"})
       console.log(error)   
    }
};