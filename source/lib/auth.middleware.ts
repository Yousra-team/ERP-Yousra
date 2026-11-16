import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt";

declare module "express-serve-static-core" {
    interface Request {
        user?: { userId: string; role: string };
    }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            res.status(401).json({message: "Missing or invalid Authorization header"})
            return
        }
        const token = header.slice(7)
        const payload = await verifyToken<{ userId: string; role: string }>(token)
        req.user = { userId: payload.userId, role: payload.role }
        next()
    } catch (error) {
        res.status(401).json({message: "Invalid or expired token"})
        console.log(error)
    }
}

export const requireRole = (allowed: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({message: "Not authenticated"})
            return
        }
        if (!allowed.includes(req.user.role)) {
            res.status(403).json({message: "Not authorized"})
            return
        }
        next()
    }
}
