import { body } from "express-validator";

export const resetTokenCodeCodeValidator = [
    body('email')
    .notEmpty()
    .isString()
    .isEmail()
    .withMessage('Email field must be provided')
]