import {app} from "./app" 
import connectDB from "./utils/db";
require("dotenv").config();

//create server
app.listen(process.env.PORT, ()=>{
    console.log(`server is running on port ${process.env.PORT}`);
    connectDB();
})