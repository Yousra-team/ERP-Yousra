
import { Request } from 'express';

// Define the shape of your user object
export interface UserPayload {
  id: string | null;
  matricule: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; // Use `user: UserPayload` if it's always guaranteed after auth middleware
    }
  }
}
