import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// method to generate Access and Refresh Token

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    // console.log("user for token: ", user);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(400, "Something went wrong during generating tokens");
  }
};

// for user Register

const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //     message: "Saurabh tumne server bana liya"
  // })
  const { userName, email, fullName, password } = req.body;
  // 1. req.body se sara data mil jayega
//   console.log(userName, email, fullName, password);
  // 2. ab check kr lo data empty string to nhi hai

  if (
    [userName, email, fullName, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  // Now find that given data exists in databse or not

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "This Account is already Exists");
  }
//   console.log(existedUser);

//   console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

//   console.log(avatarLocalPath);
//   console.log(coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is mandatory");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  let coverImage;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

//   console.log(coverImage);
//   console.log(avatar);

  if (!avatar) {
    throw new ApiError(400, "Avatar is must required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || " ",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  // new check that User successfully made a entry or not

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong during user creation");
  }

  // ab api response bjej do
  return res
    .status(200)
    .json(
      new ApiResponse(200, createdUser, "User Registration is succesfully done")
    );
});

//---------for user Login-------->

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
//   console.log("req.body", req.body);

  if (!(email || userName)) {
    throw new ApiError(400, "UserName or Email is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(500, "User does not exists");
  }
//   console.log("user:", user);

  const isPasswordValid = await user.isPasswordCorrect(password);
//   console.log("isPasswordValid:", isPasswordValid);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password is Wrong");
  }

  // agar password bhi shi hai ab hme access token or refresh
  // token generate krne hoge
  // or refreshToken ko user object mai inject bhi krna hoga
  // ye kaam hmko baar baar krna pdega
  // generate krne k liye ek nathod bana lo yahi

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );
//   console.log(`AccessToken : ${accessToken} RefreshToken: ${refreshToken}`);
  // ab fir se myi database call krenge taki new updated user aa jaye

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  console.log("Logged In user:" ,loggedInUser)

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser?.toObject(),
          refreshToken,
          accessToken,
        },
        
        "Successfully logged in"
      )
    );
});

// ---------for user Logout------>

const logoutUser = asyncHandler(async (req, res) => {
  // yaha user kaise access kre ?
  //  ek khud ka middle ware banao usko inject kr do route mai
  // then iss middle ware se cookie le kr user find

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: "" },
    },
    {
      new: true,
    }
  );
//   console.log("req.user for logout: ", req.user);

  const options = {
    htmlOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, " User logged out success"));
});

export { registerUser, loginUser, logoutUser };
