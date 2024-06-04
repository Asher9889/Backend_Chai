import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema  = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        // humne pata hai ki user ko khub search kiya jayega to iski
        // optimise banane l liye index true kr do
        index: true,

    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        // humne pata hai ki user ko khub search kiya jayega to iski
        // optimise banane l liye index true kr do
        index: true,
    },
    avatar: {
        type: String, 
        // cloudnary se link layenge
        required: true,
    },
    coverImage: {
        type: String, // cloudnary se layenge 
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, "Password is Required"]
    },
    refreshToken: {
        type: String,
    }

}, {timestamps: true})

userSchema.pre("save", async  function (next){
    // ye line pehle likhna bhut zaruri hai
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();

   
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email, 
            userName: this.userName,
            fullName: this.fullName,
            // in sb feild ko use kr k ek lambi si encrypted string bana dega JWT 
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
        
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id: this._id,
            // refresh token k liye bs id feild enough hai
            // jwt time nhi leta hai jayada isiliye promise4s use ni kiya hai
            // in sb feild ko use kr k ek lambi si encrypted string bana dega JWT 
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
        
}


export const User = mongoose.model("User", userSchema)