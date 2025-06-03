import express from 'express';
import {
        createUser,
        loginUser,
        logoutUser,
        forgotPasswordCodeGeneration,
        verifyResetCode    
    } from '../user/user.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authorization } from '../middleware/authorization.js';
import { authValidator } from '../middleware/auth.validator.js';
import { resetTokenCodeVerificationValidator } from '../middleware/verify.reset.code.validator.js';
import { resetTokenCodeCodeValidator } from '../middleware/reset.code.validator.js';
import { validateUser } from '../user/user.validator.js';



const router = express.Router();



router.post('/newUser', validateUser, validate, createUser);
router.post('/loginUser', authValidator, validate, loginUser);
router.post('/logoutUser', authorization, logoutUser);
router.patch('/forgotPassword', resetTokenCodeCodeValidator, validate, forgotPasswordCodeGeneration);
router.patch('/verifyResetCode', resetTokenCodeVerificationValidator, validate, verifyResetCode);

export default router;