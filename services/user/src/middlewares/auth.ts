import {Request, Response, NextFunction } from "express";

interface User {
    user_id: number;
    name: string;
    email: string;
    phone_number: string;
    role: "jobseeker" | "recruiter";
    bio: string | null;
    resume: string | null;
    resume_public_id: string | null; 
    prpfile_pic: string | null;
    profile_pic_public_id: string | null;
    skills: string[],
    subscription: string | null;

}

export const isAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
    } catch (error) {
        
    }
}