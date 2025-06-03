import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resetTokenCode: {
        type: String
    },
    resetTokenExpiry: {
        type: Date
    },
    isAdmin: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
