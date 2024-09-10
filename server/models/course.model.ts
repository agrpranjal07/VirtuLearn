import mongoose, { Document, Model , Schema} from "mongoose"

interface IComments extends Document{
    user:object;
    comment:string;
}

interface IReview extends Document{
    user: object;
    rating: number;
    comment: string;
    commentReplies: IComments[];
}

interface ILink extends Document{
    title: string;
    url: sting;
}

interface ICourseData extends Document{
    title: string;
    description: string;
    videourl: string;
    videoThumbnail: object;
    videoSection: string;
    videoLength: string;
    videoPlayer: string;
    links: ILink[];
    suggestion: stringl
    questions: IComment[];
}

interface ICourse extends Document{
    name: string;
    description?: string;
    price: number;
    estimatedPricce?: number;
    thumbanail: object;
    tags: string;
    demoUrl: string; 
    benefits:{title:string}[];
    prerequisites:{title: string}[];
    reviews:IReview[];
    courseData: ICourseData[];
    rating?: number;
    purchased?: number
}

const reviewSchema= new Schema<IReview>({
    user: Object,
    rating:{
        type:Number,
        default: 0
    },
    comment:String
});

const linkSchema = new Schema<ILink>({
    title: String,
    url: String
});

const commentSchema = new Schema<IComment>({
    user: Object,
    comment: String,
    commentReplies: [Object]
});

const courseDataSchema = new Schema<ICourseData>({
    videoUrl: String,
    videoThumbnail: Object,
    title: String,
    videoSection: String,
    description: String,
    videoLength: Number,
    videoPlayer: String,
    links:[linkSchema],
    suggestion:String,
    questions: [commentSchema]
})

const courseSchema= new Schema<ICourse>({
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required:true,
    },
    estimatedPrice:{
        type:Number,
    },
    thumbnail:{
        public_id:{
            required: true,
            type: String,
        },
        url:{
            required: true,
            type: String,
        }
    },
    tags:{
        type: String,
        required: true,
    },
    demoUrl:{
        type: String,
        required: true,
    },
    benefits:[{title: String}],
    prerequisites:[{title: String}],
    reviews:[reviewSchema],
    courseData:[courseDataSchema],
    ratings:{
        type: Number,
        default: 0,
    },
    purchase:{
        type: Number,
        default: 0,
    }
});

const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);

export default CourseModel;