import express from 'express';
import {
    createLand,
    createBuilding,
    editLandById,
    editBuildingById,
    deleteBuildingById,
    deleteLandById,
    uploadLandImage
} from './property.controller.js';
const router = express.Router();


router.post('/land', createLand)
router.post('/building', createBuilding)
router.delete('/deleteLand', deleteLandById)
router.delete('/deleteBuilding', deleteBuildingById )
router.patch('/editLand', editLandById)
router.patch('editBuilding', editBuildingById)
router.post('/upload', uploadLandImage)

export default router;