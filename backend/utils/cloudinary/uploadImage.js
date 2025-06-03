import cloudinary from "./cloudinary.js";


//function to upload an image to Cloudinary
export const uploadImage = async (filePath, publicId) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            public_id: publicId,
            resource_type: 'image',
            folder:'images'
        });
        console.log(`Uploaded ${publicId}: ${result.secure_url}`);
        return result.secure_url
    } catch (error) {
        console.error(`Error uploading ${publicId}: `, error)
        throw error;
    }
};
