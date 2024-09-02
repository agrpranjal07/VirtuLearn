require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import jwt, { Secret } from "jsonwebtoken";
import path from "path";
import ejs from "ejs";
import sendEmail from "../utils/sendMail";

//register user
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exist", 400));
      }
      const user: IRegistrationBody = {
        name,
        email,
        password,
      };
      
      const activationToken = createActivationToken(user);

      const activationCode = activationToken.activationCode;

      const data = { user: { name: user.name }, activationCode };

      try {
        await sendEmail({
            email: user.email,
            subject: "Activate Your VirtuLearn Account",
            template: "activation-mail.ejs",
            data,
          });
          res.status(201).json({
            success: true,
            message: `Please check your email: ${user.email} to activate your account`,
            activationToken: activationToken.token,
        });
      } catch (error: any) {
        console.log(error)
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(100 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5M",
    }
  );

  return { token, activationCode };
};


//activate user
interface IActivationRequest{
  activation_token: string;
  activation_code: string;
}

export const activateUser = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const {activation_token, activation_code} = req.body as IActivationRequest;

    const newUser:{user: IUser; activationCode: string} =jwt.verify(
      activation_token,
      process.env.ACTIVATION_SECRET as string
    ) as {user: IUser; activationCode:string}

    if(newUser.activationCode !== activation_code){
      return next(new ErrorHandler("Invalid activation code",400));
    }
    const {name, email, password} =newUser.user;
    const existUser = await userModel.findOne({email});
    if(existUser){
      return next(new ErrorHandler("Email already exist",400));
    }
    const user = await userModel.create({
      name,
      email,
      password
    })
    res.status(200).json({
      success: true,
      message: "User activated successfully",
    })
  } catch (error:any) {
    return next(new ErrorHandler(error.message,400))
  }
})