import express from "express";
import adminRoutes from "./admin/admin.route.js";
import userRoutes from "./user/user.route.js";
import superAdminRoutes from "./superAdmin/super.admin.routes.js";
/*import propertyRoutes from "./properties/property.routes.js";
import transactionRoutes from "./transactions/transaction.routes.js";*/
import paystackRoutes from "./payment/paystack.routes.js";
import dotenv from "dotenv";
import { connectToDB } from "./config/mongodb.js";
import multer from "multer";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url"; 
const port = 2002;
dotenv.config();


//configuring the pathnames for files and directories
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());

connectToDB();
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/super-admin', superAdminRoutes);
/*app.use('/api/properties', propertyRoutes);
app.use('/api/transactions', transactionRoutes);*/
app.use('/api/paystack', paystackRoutes);
app.use(cookieParser());


//static files such as pictures can be found in the assets folder in the public directory
app.use(
    "/assets", 
    express.static(
        path.join(
            __dirname, 
            "public/assets")
        )
);

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
