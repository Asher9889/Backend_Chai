import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler( async(req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // console.log("Token :", token)
        if(!token){
            throw new ApiError(401, "unauthorized request: No token is provided")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401, "Invalid refreshToken")
        }

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(402, "Invalid request during Token Access in MiddleWare")
    }
})

export { verifyJWT }