import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()
 
const allowedEmail = process.env.EMAIL_USER
const superAdminScehma = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },  
    email : {
        type:String,
        required: true,
        validate: {
            validator: function (value) {
                return value === allowedEmail;          
            },
            message: "You must have special access"
        },
    },
    password : {
        type:String,
        required: true
    },
        bankDetails: {
        accountNumber: { type: String },
        bankName: { type: String },
        accountName: { type: String },
    },
    mobileMoneyDetails: {
        provider: { type: String },
        accountNumber: { type: String },
        accountName: { type: String },
    }
});

const superAdmin = mongoose.model("superAdmin", superAdminScehma);

export default superAdmin;