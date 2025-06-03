import {body} from "express-validator";

export const authValidator = [
    
    body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Please provide a valid email address'),

    body('password')
    .notEmpty()
    .isLength({min: 6})
    .withMessage('Please provide a valid password. Password must be at least 6 characters long ')

];
