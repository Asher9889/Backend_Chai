import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"; 
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async(req, res)=> {
    // res.status(200).json({
    //     message: "Saurabh tumne server bana liya"
    // })
    const { userName, email, fullName, password } = req.body;
    // 1. req.body se sara data mil jayega
    console.log(userName, email, fullName, password )
    // 2. ab check kr lo data empty string to nhi hai

    if([userName, email, fullName, password ].some((fields)=> fields?.trim() === "")) {
        throw new ApiError(400, "All Fields are required")
    }

    // Now find that given data exists in databse or not

   const existedUser = await User.findOne({
        $or: [{userName}, {email}]
    })
    
    if(existedUser){
        throw new ApiError(409, "This Account is already Exists")
    }
    console.log(existedUser)

    console.log(req.files)

    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if(req.files && req.files.coverImage && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    } else{
        coverImageLocalPath = ""
    }
    
    console.log(avatarLocalPath)
    console.log(coverImageLocalPath)
   
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is mandatory")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        
    
    console.log(coverImage)
    console.log(avatar)

    if(!avatar){
        throw new ApiError(400, "Avatar is must required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    })

    // new check that User successfully made a entry or not

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Something went wrong during user creation")
    }

    // ab api response bjej do
    res.status(200).json(
        new ApiResponse(200, createdUser, "User Registration is succesfully done")
    )
});

export { registerUser };