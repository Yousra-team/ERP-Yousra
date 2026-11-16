import type { Request, Response, NextFunction } from "express";
import {prisma} from "../../lib/prisma";
import { LoginSchema } from './authSchema';
import * as z from "zod"
import {verifyPassword} from "../../lib/password"
import {signAccessToken} from "../../lib/jwt"

export const UserLogin = async (req: Request , res: Response): Promise<void> => {
    try {
         const result = LoginSchema.safeParse(req.body)
         if(!result.success){
         const fieldErrors = z.flattenError(result.error)
         res.status(400).json({message: "Bad request" , error: fieldErrors.fieldErrors})
         return
         }

         const data = result.data


         const user = await prisma.user.findUnique({
            where : {username : data.username}
         });

         if(!user) {
            res.status(404).json({message:"Incorrect Username or Password"})
            return
         };
         
         const comparePassword = verifyPassword(data.password , user.password)

         if(!comparePassword) {
            res.status(400).json({message: "Incorrect Matricule or Password"})
            return
         }

         const employee = await prisma.employee.findUnique({
            where : { userId : user.Id}
         });
          
      let accessToken : string;
         if(employee) {
            accessToken = await signAccessToken({
               userId : employee.employeeMatricule,
               role : user.role
            });
         } else {
             accessToken = await signAccessToken({
            userId: user.username,
            role: user.role
         });
         }
        
// find a solution for users with no employee records
       res.status(200).json(accessToken)
    } catch (error) {
        res.status(500).json({message:"An Internal error occurred"})
        console.log(error)
    }
};

export const linkUserToEmployee = async (req: Request , res: Response): Promise<void> => {
   try {
      
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