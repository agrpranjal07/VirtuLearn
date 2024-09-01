class ErrorHandler extends Error {
    statusCode: Number;
    constructor(message:any, statuscode: Number){
        super(message);
        this.statusCode= statuscode;

        Error.captureStackTrace(this,this.constructor)
    }
}

export default ErrorHandler;