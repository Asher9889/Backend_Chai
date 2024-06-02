import {v2 as cloudinary} from "cloudinary";
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY, // Click 'View Credentials' below to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) =>{
    try {
        const res = await cloudinary.uploader.upload( localFilePath, {
            resource_type: "auto",
        })
        return res;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
    
}