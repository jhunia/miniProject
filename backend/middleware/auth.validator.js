import {body} from "express-validator";

export const authValidator = [
    
    body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Please provide a valid email address'),

    body('password')
    .notEmpty()
    .isLength({min: 8})
    .withMessage('Please provide a valid password. Password must be at least 8 characters long ')

];
