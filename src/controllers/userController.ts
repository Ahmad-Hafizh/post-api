import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/hashPassword';
import { compareSync } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import ResponseHandller from '../utils/responseHandler';

export class UserController {
  async signUp(req: Request, res: Response): Promise<any> {
    try {
      const isExistUser = await prisma.user.findUnique({ where: { email: req.body.email } });
      if (isExistUser) {
        return ResponseHandller.error(res, `${isExistUser.email} is already exist, use other email address`, 400);
      }
      await prisma.user.create({
        data: { ...req.body, password: await hashPassword(req.body.password) },
      });

      return ResponseHandller.success(res, 'Your Sign up is success', 201);
    } catch (error: any) {
      return ResponseHandller.error(res, 'Your Sign up is failed', 500, error);
    }
  }

  async signIn(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const findUser = await prisma.user.findUnique({
        where: { email: req.body.email },
      });

      if (!findUser) {
        throw {
          rc: 404,
          message: 'account is not exist',
        };
      }
      const comparePassword = compareSync(req.body.password, findUser.password);
      if (comparePassword) {
        const token = sign({ id: findUser.id, email: findUser.email }, process.env.TOKEN_KEY || 'test');
        return res.status(200).send({
          name: findUser.name,
          username: findUser.username,
          email: findUser.email,
          phone: findUser.phone,
          address: findUser.address,
          token,
        });
      } else {
        throw {
          // auth gagal 401
          rc: 401,
          message: 'password is incorrect',
        };
      }
    } catch (error: any) {
      next({
        rc: error.rc || 500,
        message: 'Your Sign up is failed',
        success: false,
        error: error.message,
      });
    }
  }

  async keepLogin(req: Request, res: Response): Promise<any> {
    try {
      console.log('at keep login from controller', res.locals.decrypt);

      const findUser = await prisma.user.findUnique({
        where: { id: res.locals.decrypt.id },
      });

      if (!findUser) {
        throw {
          rc: 404,
          message: 'account is not exist',
        };
      }
      // generate token
      const token = sign({ id: findUser.id, email: findUser.email }, process.env.TOKEN_KEY || 'test');
      return res.status(200).send({
        name: findUser.name,
        username: findUser.username,
        email: findUser.email,
        phone: findUser.phone,
        address: findUser.address,
        token,
      });
    } catch (error: any) {
      return res.status(error.rc || 500).send({
        message: 'Your keep login is failed',
        success: false,
        error: error.message,
      });
    }
  }

  async updateUser(req: Request, res: Response): Promise<any> {
    try {
      const findUser = await prisma.user.findUnique({
        where: { id: res.locals.decrypt.id },
      });

      if (!findUser) {
        throw {
          rc: 404,
          message: 'account is not exist',
        };
      }

      const token = sign({ id: findUser.id, email: findUser.email }, process.env.TOKEN_KEY || 'test');
      const user = await prisma.user.update({
        where: { id: findUser.id },
        data: req.body,
      });

      return res.status(200).send({
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        token,
      });
    } catch (error: any) {
      return res.status(error.rc || 500).send({
        message: 'Your update is failed',
        success: false,
        error: error.message,
      });
    }
  }
}

export const getUserData = async (req: Request, res: Response) => {
  try {
    const query: any = req.query;
    if (query.id) query.id = parseInt(query.id);

    const users = await prisma.user.findMany({
      where: query,
    });

    res.status(200).send(users.length == 1 ? users[0] : users);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const signUp = async (req: Request, res: Response): Promise<any> => {
  try {
    const isExistUser = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (isExistUser) {
      // throw {
      //   rc: 400,
      //   message: `${isExistUser.email} is already exist, use other email address`,
      // };
      // return untuk res status
      return ResponseHandller.error(res, `${isExistUser.email} is already exist, use other email address`, 400);
    }
    await prisma.user.create({
      data: { ...req.body, password: await hashPassword(req.body.password) },
    });

    // return res.status(201).send({
    //   message: 'Your Sign up is success',
    //   success: true,
    // });
    return ResponseHandller.success(res, 'Your Sign up is success', 201);
  } catch (error: any) {
    // return res.status(error.rc || 500).send({
    //   message: 'Your Sign up is failed',
    //   success: false,
    //   error: error.message,
    // });
    return ResponseHandller.error(res, 'Your Sign up is failed', 500, error);
  }
};

export const signIn = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const findUser = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!findUser) {
      throw {
        rc: 404,
        message: 'account is not exist',
      };
    }
    // check password by comparing to the hash
    const comparePassword = compareSync(req.body.password, findUser.password);
    if (comparePassword) {
      // id jangan langsung dikirim ke response pake encrypt toke encoding decoding
      const token = sign({ id: findUser.id, email: findUser.email }, process.env.TOKEN_KEY || 'test');
      return res.status(200).send({
        name: findUser.name,
        username: findUser.username,
        email: findUser.email,
        phone: findUser.phone,
        address: findUser.address,
        token,
      });
    } else {
      throw {
        // auth gagal 401
        rc: 401,
        message: 'password is incorrect',
      };
    }
  } catch (error: any) {
    next({
      rc: error.rc || 500,
      message: 'Your Sign up is failed',
      success: false,
      error: error.message,
    });
    // return res.status(error.rc || 500).send({
    //   message: 'Your Sign up is failed',
    //   success: false,
    //   error: error.message,
    // });
  }
};

export const keepLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log('at keep login from controller', res.locals.decrypt);

    const findUser = await prisma.user.findUnique({
      where: { id: res.locals.decrypt.id },
    });

    if (!findUser) {
      throw {
        rc: 404,
        message: 'account is not exist',
      };
    }
    // generate token
    const token = sign({ id: findUser.id, email: findUser.email }, process.env.TOKEN_KEY || 'test');
    return res.status(200).send({
      name: findUser.name,
      username: findUser.username,
      email: findUser.email,
      phone: findUser.phone,
      address: findUser.address,
      token,
    });
  } catch (error: any) {
    return res.status(error.rc || 500).send({
      message: 'Your keep login is failed',
      success: false,
      error: error.message,
    });
  }
};

export const updateUserData = async (req: Request, res: Response): Promise<any> => {
  try {
    // console.log(res.locals.decrypt.id);

    const findUser = await prisma.user.findUnique({
      where: { id: res.locals.decrypt.id },
    });

    if (!findUser) {
      throw {
        rc: 404,
        message: 'account is not exist',
      };
    }

    const token = sign({ id: findUser.id, email: findUser.email }, process.env.TOKEN_KEY || 'test');
    const user = await prisma.user.update({
      where: { id: findUser.id },
      data: req.body,
    });

    return res.status(200).send({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      token,
    });
  } catch (error: any) {
    return res.status(error.rc || 500).send({
      message: 'Your update is failed',
      success: false,
      error: error.message,
    });
  }
};

export const deleteUserData = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};
