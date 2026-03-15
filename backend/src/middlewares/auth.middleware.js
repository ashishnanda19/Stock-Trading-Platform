import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from"jsonwebtoken"
import dotenv from "dotenv"
import { pool } from "../db/index.js";
dotenv.config();
export const verifyJWT=asyncHandler(async (req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token) throw new ApiError(401,"Unauthorized request")
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const [rows]=await pool.query("SELECT id, username, email FROM Users WHERE id = ?",[decodedToken?.id])
        if(rows.length===0) throw new ApiError(401,"Invalid Access Token")
        req.user=rows[0]
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})