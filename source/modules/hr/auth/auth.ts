import type { Request, Response, NextFunction } from "express";
import {prisma} from "../../../lib/prisma";
import { LoginSchema } from './authSchema';
import * as z from "zod"
import {verifyPassword} from "../../../lib/password"
import {signAccessToken} from "../../../lib/jwt"

export const loginEmployee = async (req: Request , res: Response): Promise<void> => {
    try {
         const result = LoginSchema.safeParse(req.body)
         if(!result.success){
         const fieldErrors = z.flattenError(result.error)
         res.status(400).json({message: "Bad request" , error: fieldErrors.fieldErrors})
         return
         }

         const data = result.data
         
         const employee = await prisma.employee.findUnique({
            where: {employeeMatricule: data.matricule},
            include: {user: true}
         });

         

         if(!employee) {
            res.status(404).json({message:"Incorrect Matricule or Password"})
            return
         };
         
         if(!employee.user) {
            res.status(404).json({message: "Incorrect Matricule or Password"})
            return
         };

         const comparePassword = verifyPassword(data.password , employee.user.password)

         if(!comparePassword) {
            res.status(400).json({message: "Incorrect Matricule or Password"})
            return
         }
        
         const accessToken = await signAccessToken({
            userId: employee.employeeMatricule,
            role: employee.user.role
         });
// find a solution for users with no employee records
       res.status(200).json(accessToken)
    } catch (error) {
        res.status(500).json({message:"An Internal error occurred"})
        console.log(error)
    }
};

export const changePassword = async (req: Request , res: Response): Promise<void> => {
   try {
        const employeeMatricule = req.user
   } catch (error) {
      
   }
};