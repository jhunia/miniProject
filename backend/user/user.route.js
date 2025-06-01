import express from 'express';
import { createUser } from '../user/user.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateUser } from '../user/user.validator.js';
const router = express.Router();
router.post('/newUser', validateUser, validate, createUser);

export default router;