import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import ResponseHandler from '../utils/responseHandler';

export const regisValidation: any = [
  body('name').notEmpty(),
  body('username').notEmpty(),
  body('email').notEmpty().isEmail().withMessage('Email is required'),
  body('password').notEmpty().isStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  }),
  (req: Request, res: Response, next: NextFunction) => {
    const errorValidation = validationResult(req);
    if (!errorValidation.isEmpty()) {
      console.log(errorValidation);
      return ResponseHandler.error(res, 'Your data is invalid', 400, errorValidation);
    }
    next();
  },
];
