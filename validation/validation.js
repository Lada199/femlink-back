import {body} from 'express-validator' 

export const loginValidation = [
    body('email').isEmail(),
    body('password').isLength({min: 5}),
]
export const registerValidation = [
    body('email').isEmail(),
    body('password').isLength({min: 5}),
    body('fullName').isLength({min: 3}),
   
]
export const commentCreateValidation = [
    body('content').isLength({min:3}).isString(),
   
   
]
export const postCreateValidation = [
    body('title', 'Введите заголовок статьи').isLength({min:3}).isString(),
    body('content', 'Введите текст статьи').isLength({min: 10}).isString(),
    body('dateOfStart', 'Введите корректное число, минимум 10 символов').isNumeric().isLength({ min: 6 }),
    body('type').isString(),
    body('places').isNumeric(),
    body('location', 'Введите заголовок статьи').isLength({min:3}).isString(),
]