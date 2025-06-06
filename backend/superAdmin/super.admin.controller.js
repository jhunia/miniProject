import Admin from "../admin/admin.model.js";
import User from "../user/user.model.js";
import landModel from "../properties/land.model.js";
import buildingModel from "../properties/building.model.js";
import transactionModel from "../transactions/transaction.model.js";

// Get all admins
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select("-password");
        res.status(200).json({
            success: true,
            data: admins
        });

        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No admins found"
            });
        }
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({
            success: true,
            data: users
        });
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found"
            });
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

//get all lands
export const getAllLands = async (req, res) => {
    try {
        const allLands = await landModel.find().populate("owner", "name email");
        res.status(200).json({
            success: true,
            data: allLands
        
        });
        if (allLands.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No lands found"
            });
        }
    } catch (error) {
        console.error("Error fetching lands:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

//get all buildings
export const getAllBuildings = async (req, res) => {
    try {
        const allBuildings = await buildingModel.find().populate("owner", "name email");
        res.status(200).json({
            success: true,
            data: allBuildings
        });
        if (allBuildings.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No buildings found"
            });
        }
    } catch (error) {
        console.error("Error fetching buildings:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Get all transactions
export const getAllTransactions = async (req, res) => {
    try {
        const allTransactions = await transactionModel.find().populate("buyer", "name email").populate("propertyOwner", "name email").populate("property", "location type price");  
        res.status(200).json({
            success: true,
            data: allTransactions
        });
        if (allTransactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No transactions found"
            });
        }
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

