import express from 'express';
import {createAdmin} from '../admin/admin.controller.js';
import {validate} from '../middleware/validate.middleware.js';
import {validateAdmin} from '../admin/admin.validator.js';
const router = express.Router();
router.post('/newAdmin', validateAdmin, validate, createAdmin);

export default router;