import Admin from "../admin/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 


export const createAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ 
                success: false,
                message: "Admin already exists" 
            });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);


        // Create new admin
        const newAdmin = new Admin({ name, email, password: hashedPassword });

        const newAdminWithoutPassword = {...newAdmin.toObject(), password: hashedPassword};
        await newAdmin.save();
        return res.status(201).json({ 
            success: true,
            message: "Admin created successfully" ,
             data: newAdminWithoutPassword
        });
    } catch (error) {
        console.error("Error creating admin:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};


//Login Admin
export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if admin exists
        const existingAdmin = await Admin.findOne({ email });
        if (!existingAdmin) {
            return res.status(404).json({ 
                success: false,
                message: "Admin not found" 
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, existingAdmin.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(400).json({ 
                success: false,
                message: "JWT secret not configured"}
            )}

        // Generate JWT token
        const token = jwt.sign({ id: existingAdmin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("jwtToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set to true in production
            sameSite: "strict", // Adjust as needed
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        const newAdminWithoutPassword={ ...existingAdmin.toObject(), password: undefined };

        return res.status(200).json({ 
            success: true,
            message: "Login successful",
            data: { token } , newAdminWithoutPassword
        });
    } catch (error) {
        console.error("Error logging in admin:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

//Logout Admin
export const logoutAdmin = (req, res) => {
    res.clearCookie("jwtToken");
    return res.status(200).json({ 
        success: true,
        message: "Logout successful" 
    });
};

