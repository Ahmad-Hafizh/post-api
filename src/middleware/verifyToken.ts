import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // decrypt token from req header
    // console.log('from request header', req.headers);
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw {
        rc: 404,
        status: false,
        message: 'Token not Exist',
      };
    }

    const checkToken = verify(token, process.env.TOKEN_KEY || 'test');
    // console.log(checkToken);

    res.locals.decrypt = checkToken;
    next(); //meneruskqn process ke controller selanjutnya
  } catch (error: any) {
    console.log(error.message);
    res.status(401).send({
      message: 'Unauthorized token is invalid',
      success: false,
    });
  }
};
