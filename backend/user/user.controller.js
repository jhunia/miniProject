import User from "../user/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 

export const createUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }
             const saltRounds = 10;
             const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Create new user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const newUserWithoutPassword = {...newUser.toObject(), password: hashedPassword};
        await newUser.save();
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: newUserWithoutPassword
        });
           

   } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

//Login User
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, existingUser.password);
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
        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("jwtToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set to true in production
            sameSite: "strict", // Adjust as needed
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        const newUserWithoutPassword={ ...existingUser.toObject(), password: undefined };

        return res.status(200).json({ 
            success: true,
            message: "Login successful",
            data: { token } , newUserWithoutPassword
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

//Logout User
export const logoutUser = (req, res) => {
    res.clearCookie("jwtToken");
    return res.status(200).json({ 
        success: true,
        message: "Logout successful" 
    });
};


