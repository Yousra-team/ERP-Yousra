import type { Request, Response, NextFunction } from "express";
import {prisma} from "../../../lib/prisma";
import { updateUserSchema, userSchema } from './userSchema';
import * as z from "zod";
import { hashPassword } from '../../../lib/password';

export const createUser = async (req: Request , res: Response): Promise<void> => {
    try {

        const result = userSchema.safeParse(req.body)
        if(!result.success) {
        const fieldErrors = z.flattenError(result.error)
        res.status(400).json({message:"Bad Request Schema" , error: fieldErrors.fieldErrors})
        return
        }

        const data = result.data;

        const hashedPassword : string = await hashPassword(data.password)

        const createNewUser = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword
            }
        });

       res.status(201).json(createNewUser)
    } catch (error) {
         res.status(500).json({message:"Internal Server Error"})
        console.log(error)
    }
};

export const getUsers = async(req: Request , res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users)
    } catch (error) {
         res.status(500).json({message:"Internal Server Error"})
        console.log(error)
    }
};

export const getUserById = async (req: Request , res: Response): Promise<void> => {
    try {
         const id = req.params.userId as string;
         
         if(!id) {
            res.status(400).json({message: "No userId"})
            return
         }

         const user = await prisma.user.findUnique({
            where: {
                Id: id
            }
         });

         if(!user) {
            res.status(404).json({message:" User does not exist"})
            return
         }

         res.status(200).json(user)
    } catch (error) {
         res.status(500).json({message:"Internal Server Error"})
        console.log(error)
    }
};

export const updateUser = async (req: Request , res: Response): Promise<void> => {
    try {
        const id = req.params.userId as string
        if(!id) {
            res.status(400).json({message:"No userId found"})
            return
        }

        const result = updateUserSchema.safeParse(req.body)
        if(!result.success) {
        const fieldErrors = z.flattenError(result.error)
        res.status(400).json({message:"Bad Request Schema" , error: fieldErrors.fieldErrors})
        return
        }

        const data = result.data;

        if(data.password) {
            const hashedPassword: string = await hashPassword(data.password)
            data.password = hashedPassword;
        }

        const updatedUser = await prisma.user.update({
            where: {
                Id: id
            },
            data: {
                ...data
            }
        })
         res.status(200).json(updatedUser)
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
        console.log(error)
    }
};