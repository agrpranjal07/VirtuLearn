import {NextFunction, Request, Response} from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary  from "cloudinary"
import { createCourse } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import userModel from "../models/user.model";

//upload course
export const uploadCourse= CatchAsyncError( async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const data = req.body
        const thumbnail = data.thumbnail;
        if(thumbnail){
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail.url,{
                folder:"courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            }
        }
        createCourse(data,res, next);
        }
    catch(error: any){
        return next(new ErrorHandler(error.message, 500));
    }
})

//edit course
export const editCourse= CatchAsyncError( async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const data = req.body
        const thumbnail = data.thumbnail;
        if(thumbnail){
            await cloudinary.v2.uploader.destroy(thumbnail.public_id);
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail.url,{
                folder:"courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            }
        }
        const courseId = req.params.id;
        const course = await CourseModel.findByIdAndUpdate(courseId,
            {
                $set: data
            },
            {new: true}
        );
        
        res.status(201).json({
            success: true,
            course
        })
        }
    catch(error: any){
        return next(new ErrorHandler(error.message, 500));
    }
})

//get single course --without purchasing
export const getSingleCourse= CatchAsyncError( async(req:Request,res:Response,next:NextFunction)=>{
    try {

        const courseId = req.params.id;

        const courseJson = await redis.get(courseId);
        if (courseJson) {
            const course = JSON.parse(courseJson);
            res.status(201).json({
                success: true,
                course
            })
        }
        else{
            const course = await CourseModel.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            
            await redis.set(courseId,JSON.stringify(course));

            res.status(201).json({
            success: true,
            course
        })
        }
        
        }
    catch(error: any){
        return next(new ErrorHandler(error.message, 500));
    }
})

//get all courses --without purchasing
export const getAllCourses= CatchAsyncError( async(req:Request,res:Response,next:NextFunction)=>{
    try {

        const courseJson = await redis.get("allCourses");
        if (courseJson) {
            const courses = JSON.parse(courseJson);
            res.status(200).json({
                success: true,
                courses
            })
        }
        else{

        const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");

        await redis.set("allCourses",JSON.stringify(courses));
        res.status(200).json({
            success: true,
            courses
        })
        }  
    }
    catch(error: any){
        return next(new ErrorHandler(error.message, 500));
    }
})

//get course content -- only for valid users
export const getCourseByUser= CatchAsyncError( async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const user = await userModel.findById(req.user?._id);
        const userCourseList = user?.courses;

        const courseId = req.params.id;

        const courseExists = userCourseList?.find((course:any)=> {
            return course._id.toString() === courseId;
        }); 

        if(!courseExists){
            return next(new ErrorHandler("Course not found", 404));
        }

        const content = await CourseModel.findOne({ _id: courseId });

        res.status(200).json({
            success: true,
            content
        })
    }
    catch(error: any){
        return next(new ErrorHandler(error.message, 500));
    }
})