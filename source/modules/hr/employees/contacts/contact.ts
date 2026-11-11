import { Request, Response } from "express";
import {prisma} from "../../../../lib/prisma";
import * as z from "zod";
import { emergencyContactSchema, updateContactSchema } from "./contactSchema";


export const addContact = async (req: Request , res: Response): Promise<void> => {
    try {
   const matricule : string = req.params.matricule as string
 
        if(!matricule){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }
       const result = emergencyContactSchema.safeParse(req.body)
         if(!result.success) {
           const fieldErrors = z.flattenError(result.error)
           res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
           return
        }
               
      const data = result.data

      const newContact = await prisma.emergencyContact.create({
        data: {
            ...data,
            employeeMatricule : matricule
        }
      });

      res.status(200).json(newContact)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when adding Parent" , error: error})
      console.log(error)
    }
};


export const updateContact = async (req: Request , res: Response): Promise<void> => {
    try {
   const matricule : string = req.params.matricule as string
   const contactId : string = req.params.contactId as string
 
        if(!matricule && !contactId){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }
       const result = updateContactSchema.safeParse(req.body)
         if(!result.success) {
           const fieldErrors = z.flattenError(result.error)
           res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
           return
        }
               
      const data = result.data

      const newContact = await prisma.emergencyContact.update({
        where: {
           contactId : contactId,
           employeeMatricule: matricule
        },
        data: {
            ...data,
            employeeMatricule : matricule
        }
      });

      res.status(200).json(newContact)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when adding Parent" , error: error})
      console.log(error)
    }
};

export const getContact = async (req: Request , res: Response): Promise<void> => {
    try {
   const matricule : string = req.params.matricule as string
   const contactId : string = req.params.contactId as string
 
        if(!matricule && !contactId){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }
       const result = emergencyContactSchema.safeParse(req.body)
         if(!result.success) {
           const fieldErrors = z.flattenError(result.error)
           res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
           return
        }
               
      const data = result.data

      const Contact = await prisma.emergencyContact.findUnique({
        where:{
            employeeMatricule : matricule,
            contactId : contactId
        },
      });

      res.status(200).json(Contact)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when adding Parent" , error: error})
      console.log(error)
    }
};


export const getContacts = async (req: Request , res: Response): Promise<void> => {
    try {
   const matricule : string = req.params.matricule as string
   const contactId : string = req.params.contactId as string
 
        if(!matricule && !contactId){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }
       const result = emergencyContactSchema.safeParse(req.body)
         if(!result.success) {
           const fieldErrors = z.flattenError(result.error)
           res.status(400).json({message:"Bad Schema" , error: fieldErrors.fieldErrors})
           return
        }
               
      const data = result.data

      const Contact = await prisma.emergencyContact.findUnique({
        where:{
            employeeMatricule : matricule,
            contactId : contactId
        },
      });

      res.status(200).json(Contact)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when adding Parent" , error: error})
      console.log(error)
    }
};

export const deleteContact = async (req: Request , res: Response): Promise<void> => {
    try {
        const matricule = req.params.matricule as string
        const contactId = req.params.contactId as string

        if(!matricule && !contactId){
             res.status(400).json({message: "Invalid Parameters"})
             return
          }

          const deleted = await prisma.emergencyContact.delete({
            where: {
                employeeMatricule : matricule,
                contactId : contactId
            },
          })

          res.status(200).json(deleted)
    } catch (error) {
      res.status(500).json({message: "Internal Server Error when adding Parent" , error: error})
      console.log(error)
    }
};