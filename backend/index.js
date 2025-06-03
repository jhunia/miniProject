import express from "express";
import adminRoutes from "./admin/admin.route.js";
import userRoutes from "./user/user.route.js";
import { connectToDB } from "./config/mongodb.js";
import multer from "multer";
const port = 2002;

const app = express();
app.use(express.json());

connectToDB();
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);


//all uploaded files will be stored in the defined storage
const storage = multer.diskStorage(
    {
        destination: function (req, file, cb){
            cb(null, "public/assets");
        },
        filename: function(req, file, cb){
            cb(null, file.originalname);
        }
    }
);
const upload = multer(
    {
        storage 
    }
);

app.listen(port, () => {
    console.log(`server is listening on port ${port} 🔌`)
})
