import type { Request, Response, NextFunction } from "express";
import {prisma} from "../../lib/prisma";
import { LoginSchema, updatePasswordSchema } from './authSchema';
import * as z from "zod"
import {hashPassword, verifyPassword} from "../../lib/password"
import {signAccessToken} from "../../lib/jwt"

export const loginEmployee = async (req: Request , res: Response): Promise<void> => {
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
         
         const comparePassword = await verifyPassword(data.password , user.password)

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
        // requireAuth puts the token payload on req.user
        if(!req.user) {
            res.status(401).json({message: "Not authenticated"})
            return
        }

        const result = updatePasswordSchema.safeParse(req.body)
        if(!result.success){
            const fieldErrors = z.flattenError(result.error)
            res.status(400).json({message: "Bad Schema" , error: fieldErrors.fieldErrors})
            return
        }

        const data = result.data

        // Tokens carry the matricule for employees and the username for other users,
        // and both are stored in the username column
        const user = await prisma.user.findUnique({
            where : {username : req.user.userId}
        });

        if(!user) {
            res.status(404).json({message: "User not found"})
            return
        }

        const comparePassword = await verifyPassword(data.currentPassword , user.password)
        if(!comparePassword) {
            res.status(400).json({message: "Current password is incorrect"})
            return
        }

        const hashedPassword: string = await hashPassword(data.newPassword)

        const updatedUser = await prisma.user.update({
            where: {
                Id : user.Id
            },
            data: {
                password : hashedPassword
            }
        });

        res.status(200).json({message: "Password updated"})
   } catch (error) {
        res.status(500).json({message:"An Internal error occurred"})
        console.log(error)
   }
};