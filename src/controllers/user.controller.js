import { asyncHandler } from "../utils/asyncHandler.js"; 

const registerUser = asyncHandler( async(req, res)=> {
    res.status(200).json({
        message: "Saurabh tumne server bana liya"
    })
});

export { registerUser };