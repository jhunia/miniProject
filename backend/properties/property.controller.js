import landModel from "../properties/land.model.js";
import buildingModel from "../properties/building.model.js";
import mongoose from "mongoose";
import { upload_using_multer } from "../utils/multer/multer.upload.js";
import { uploadImage } from "../utils/cloudinary/uploadImage.js";
import Admin from "../admin/admin.model.js";


// creating land
export const createLand = async (req, res) => {
  try {
    
    const newLand = new landModel(req.body);
    
    // check if land with the same location already exists
    const existingLand = await landModel.findOne({ location: newLand.location });
    
    if (existingLand) {
      return res.status(400).json({ 
        message: "Land with this location already exists",
        success: false
    });
    }
    await newLand.save();
    res.status(201).json(newLand);
  } catch (error) {
    res.status(500).json({ message: "Error creating land", error });
  }
};


// creating building
export const createBuilding = async (req, res) => {
  try {
    
// if building already exists
    const existingBuilding = await buildingModel.findOne({ location: req.body.location });
    if (existingBuilding) {
      return res.status(400).json({ 
        message: "Building with this location already exists",
        success: false
      });
    }
    const newBuilding = new buildingModel(req.body);
    await newBuilding.save();
    res.status(201).json(newBuilding);
  } catch (error) {
    res.status(500).json({ message: "Error creating building", error });
  }
};


//get all lands
export const getAllLands = async (req, res) => {
  try {
    const allLands = await landModel.find().populate("owner", "name email");
    res.status(200).json({
        data: allLands
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching lands", error });
  }
};


//get all buildings
export const getAllBuildings = async (req, res) => {
  try {
    const allBuildings = await buildingModel.find().populate("owner", "name email");
    res.status(200).json({
        data: allBuildings
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching buildings", error });
  }
};


//edit land by id
export const editLandById = async (req, res) => {
    const {id} = req.params;
    const {updatedData} = req.body;
    const newLand = new landModel(req.body);
    try{
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                 message: "Invalid land ID",
                 success: false
            });
        }const land = await landModel.findById(id);
        if (!land) {
            return res.status(404).json({
                message: "Land not found",
                success: false
            });
        }
        if (!updatedData || typeof updatedData !== 'object' || Object.keys(updatedData).length === 0) {
            return res.status(400).json({
                message: "Invalid data provided for update",
                success: false
            });
        }

        const updatedLand = await landModel.findByIdAndUpdate(
            id,
            {$set: updatedData},
            { new: true, runValidators: true , select : '-__v' } // Exclude __v field
        );
        if (!updatedLand) {
            return res.status(404).json({
                message: "Land not found",
                success: false
            });
        }
        res.status(200).json({
            message: "Land updated successfully",
            data: updatedLand,
            success: true
        });
    }catch (error) {
        return res.status(500).json({
            message: "Error fetching land",
            error,
            success: false
        });
    }
};

//edit building by id
export const editBuildingById = async (req, res) => {
    const {id} = req.params;
    const {updatedData} = req.body;
    try{
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                 message: "Invalid building ID",
                 success: false
            });
        }
        const building = await buildingModel.findById(id);
        if (!building) {
            return res.status(404).json({
                message: "Building not found",
                success: false
            });
        }
        if (!updatedData || typeof updatedData !== 'object' || Object.keys(updatedData).length === 0) {
            return res.status(400).json({
                message: "Invalid data provided for update",
                success: false
            });
        }
        const updatedBuilding = await buildingModel.findByIdAndUpdate(
            id,
            {$set: updatedData},
            { new: true, runValidators: true , select : '-__v' } // Exclude __v field
        );
        if (!updatedBuilding) {
            return res.status(404).json({
                message: "Building not found",
                success: false
            });
        }
        res.status(200).json({
            message: "Building updated successfully",
            data: updatedBuilding,
            success: true
        }); 
    }catch (error) {
        return res.status(500).json({
            message: "Error fetching building",
            error,
            success: false
        });
        }
    };


//delete land by id
export const deleteLandById = async (req, res) => {
    const {id} = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                 message: "Invalid land ID",
                 success: false
            });
        }
        const deletedLand = await landModel.findByIdAndDelete(id);
        if (!deletedLand) {
            return res.status(404).json({
                message: "Land not found",
                success: false
            });
        }
        res.status(200).json({
            message: "Land deleted successfully",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error deleting land",
            error,
            success: false
        });
    }
}

//delete building by id
export const deleteBuildingById = async (req, res) => {
    const {id} = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                 message: "Invalid building ID",
                 success: false
            });
        }
        const deletedBuilding = await buildingModel.findByIdAndDelete(id);
        if (!deletedBuilding) {
            return res.status(404).json({
                message: "Building not found",
                success: false
            });
        }
        res.status(200).json({
            message: "Building deleted successfully",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error deleting building",
            error,
            success: false
        });
    }
}

//upload image for land
export const uploadLandImage = async (req, res) => {
    upload_using_multer(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                message: "Error uploading image",
                error: err.message,
                success: false
            });
        }
        try {
            const imagePath = req.file.path;
            const uploadedImage = await uploadImage(imagePath);
            res.status(200).json({
                message: "Image uploaded successfully",
                data: uploadedImage,
                success: true
            });
        } catch (error) {
            res.status(500).json({
                message: "Error uploading image to cloud",
                error,
                success: false
            });
        }
    });
};