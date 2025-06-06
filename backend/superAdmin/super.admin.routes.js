import express from 'express';
import {
    createSuperAdmin,
    /*loginSuperAdmin,
    logoutSuperAdmin,
    forgotPasswordCodeGeneration,
    verifyResetCode,*/
    getAllAdmins,
    getAllUsers,
    getAllLands,
    getAllBuildings,
    getAllTransactions
} from './super.admin.controller.js';

const router = express.Router();
router.get('/create-super', createSuperAdmin)

router.get('/admins', getAllAdmins);
router.get('/users', getAllUsers);
router.get('/lands', getAllLands);
router.get('/buildings', getAllBuildings);
router.get('/transactions', getAllTransactions);

export default router;
