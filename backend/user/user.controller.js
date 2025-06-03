import User from "../user/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 
import { hmacProcess } from "../middleware/hmac.js";
import transporter from "../middleware/send.mail.js";

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
   try{
            res.clearCookie("jwtToken",{
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict", 
            });
    return res.status(200).json({ 
        success: true,
        message: "Logout successful" 
    });
    }catch (error) {
        console.error("Error logging out User:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }

};

//forgot password
export const forgotPasswordCodeGeneration= async (req, res) => {
    const { email } = req.body;

    try {
        // Check if User exists
        const existingUser = await User.findOne({email});
        if (!existingUser) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        const Userfirstname = existingUser.name;
        
        //generate reset token

        let resetTokenCode = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
        const htmlContent = `
        <p>Dear ${Userfirstname},</p>
        <p>We received a request to reset your password. Your reset code is: <strong>${resetTokenCode}</strong></p>
        <p>This code is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
        <p>Thank you,<br>estateHuve</p>
        `;

        let info =await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: existingUser.email,
            subject: "🔐 Password Reset Code",
            html: htmlContent
        });

        if (info.response && info.response.includes("OK")) {
                const hashedCode =hmacProcess(resetTokenCode , process.env.HMAC_SECRET_CODE);
                existingUser.resetTokenCode = hashedCode;
                existingUser.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now
                await existingUser.save();

                return res.status(200).json({ 
                    success: true,
                    message: "Reset code sent successfully" 
                });
            }
            } catch (error) {
                console.error("Error sending reset code:", error);
                return res.status(500).json({ 
                    success: false,
                    message: "Internal server error" 
                });
            }
        }

        // verify reset code
        export const verifyResetCode = async (req, res) => {
            const { email, resetTokenCode , newPassword } = req.body;
            try{
                 const existingUser = await User.findOne({ email }).select('resetTokenCode resetTokenExpiry');
                if (!existingUser) {
                    return res.status(404).json({ 
                        success: false,
                        message: "User not found" 
                   });
                }

                if(!existingUser.resetTokenCode ) {
                    return res.status(400).json({ 
                        success: false,
                        message: "Invalid reset code request. Please request a new reset code." 
                    });
                }

                if(Date.now() > existingUser.resetTokenExpiry) {
                    return res.status(400).json({ 
                        success: false,
                        message: "Reset code has expired. Please request a new reset code." 
                    });
                }

                // Check if reset code is valid
              /*  const hashedCode = hmacProcess(resetTokenCode, process.env.HMAC_SECRET_CODE);
                if (existingUser.resetTokenCode !== hashedCode || Date.now() > existingUser.resetTokenExpiry) {
                    return res.status(400).json({ 
                        success: false,
                        message: "Invalid or expired reset code" 
                    });
                }*/

                const hashedCode = hmacProcess(resetTokenCode, process.env.HMAC_SECRET_CODE);
                if(hashedCode === existingUser.resetTokenCode && Date.now() <= existingUser.resetTokenExpiry) {
                    // Reset code is valid, proceed to reset password
                    existingUser.resetTokenCode = undefined; // Clear reset code
                    existingUser.resetTokenExpiry = undefined; // Clear expiry
                }

                // Hash the new password
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                existingUser.password = hashedPassword; // Update password
                await existingUser.save();

                return res.status(200).json({ 
                    success: true,
                    message: "Password reset successfully" 
                });
            } catch (error) {
                console.error("Error verifying reset code:", error);
                return res.status(500).json({ 
                    success: false,
                    message: "Internal server error" 
                });
            }

        }
