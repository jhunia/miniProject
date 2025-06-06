import { uploadImage } from "../cloudinary/uploadImage.js";
import path from "path"
import multer from "multer";

//configuring multer
const storage = multer.diskStorage({
    destination: (req, file ,cb) => {
        cb(null, 'utils/multer/multerImages')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
})

//allowing only images
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype)

    if(extname && mimetype){
        return cb(null, true);
    }else{
        cb(new Error('Only .png .jpg .jpeg .svg format are allowed'));
    }
}

export const upload_using_multer = multer ({
    storage: storage,
    limits: { fileSize : 5 * 1024 * 1024},
    fileFilter: fileFilter
}).single('image');