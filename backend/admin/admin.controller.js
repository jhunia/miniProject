import Admin from "../admin/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 
import { hmacProcess } from "../middleware/hmac.js";
import transporter from "../middleware/send.mail.js";


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

        res.cookie('adminJwtToken', token, {
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
        console.error("Error logging out admin:", error);
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
        // Check if admin exists
        const existingAdmin = await Admin.findOne({email});
        if (!existingAdmin) {
            return res.status(404).json({ 
                success: false,
                message: "Admin not found" 
            });
        }

        const adminfirstname = existingAdmin.name;
        
        //generate reset token

        let resetTokenCode = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
        const htmlContent = `
        <p>Dear ${adminfirstname},</p>
        <p>We received a request to reset your password. Your reset code is: <strong>${resetTokenCode}</strong></p>
        <p>This code is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
        <p>Thank you,<br>estateHuve</p>
        `;

        let info =await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: existingAdmin.email,
            subject: "🔐 Password Reset Code",
            html: htmlContent
        });

        if (info.response && info.response.includes("OK")) {
                const hashedCode =hmacProcess(resetTokenCode , process.env.HMAC_SECRET_CODE);
                existingAdmin.resetTokenCode = hashedCode;
                existingAdmin.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now
                await existingAdmin.save();

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
                 const existingAdmin = await Admin.findOne({ email }).select('resetTokenCode resetTokenExpiry');
                if (!existingAdmin) {
                    return res.status(404).json({ 
                        success: false,
                        message: "Admin not found" 
                   });
                }

                if(!existingAdmin.resetTokenCode ) {
                    return res.status(400).json({ 
                        success: false,
                        message: "Invalid reset code request. Please request a new reset code." 
                    });
                }

                if(Date.now() > existingAdmin.resetTokenExpiry) {
                    return res.status(400).json({ 
                        success: false,
                        message: "Reset code has expired. Please request a new reset code." 
                    });
                }

                // Check if reset code is valid
              /*  const hashedCode = hmacProcess(resetTokenCode, process.env.HMAC_SECRET_CODE);
                if (existingAdmin.resetTokenCode !== hashedCode || Date.now() > existingAdmin.resetTokenExpiry) {
                    return res.status(400).json({ 
                        success: false,
                        message: "Invalid or expired reset code" 
                    });
                }*/

                const hashedCode = hmacProcess(resetTokenCode, process.env.HMAC_SECRET_CODE);
                if(hashedCode === existingAdmin.resetTokenCode && Date.now() <= existingAdmin.resetTokenExpiry) {
                    // Reset code is valid, proceed to reset password
                    existingAdmin.resetTokenCode = undefined; // Clear reset code
                    existingAdmin.resetTokenExpiry = undefined; // Clear expiry
                }

                // Hash the new password
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                existingAdmin.password = hashedPassword; // Update password
                await existingAdmin.save();

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