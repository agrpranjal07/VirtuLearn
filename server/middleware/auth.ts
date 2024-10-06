import { Request, Response, NextFunction } from "express";
import { CatchAsyncErrors } from "./CatchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt,{JwtPayload} from "jsonwebtoken";
import { redis } from "../utils/redis";
import userModel from "../models/user.model";


//authenticated user
export const isAuthenticated = CatchAsyncErrors(async (req:Request,res:Response,next:NextFunction)=>{
    const access_token = req.cookies.access_token as string;

    if(!access_token){
        // next();
        return next(new ErrorHandler("Please login to access this route",400))
    }

    const decoded = jwt.verify(access_token,process.env.ACCESS_TOKEN as string) as JwtPayload;

    if(!decoded){
        return next(new ErrorHandler("user token is not valid",400))
    }
    const user = await redis.get(decoded.id);
    if(!user){
        return next(new ErrorHandler("user not found",400))
    }
    req.user = JSON.parse(user);
    next();
})

//validate user role
export const authorizeRoles = (...roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction)=>{
        const user = await userModel.findById(req.user?._id);
        if(!roles.includes(user?.role || "")){
            return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource`,400));
        }
        next();
    }
}