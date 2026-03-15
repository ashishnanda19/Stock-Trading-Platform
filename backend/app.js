import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app=express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))///limits the json file
app.use(express.urlencoded({extended:true,limit:"16kb"}))///limit the url
app.use(express.static("public"))///like pdf all that
app.use(cookieParser())
