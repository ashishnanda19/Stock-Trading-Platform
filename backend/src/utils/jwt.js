import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();
export const generateAccessToken=function(user){
    return jwt.sign({id:user.id,username:user.username},process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
}
export const generateRefreshToken=function(user){
    return jwt.sign({id:user.id,username:user.username},process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
}
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};