import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/hashPassword';
import { compareSync } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import ResponseHandller from '../utils/responseHandler';
import { transporter } from '../config/nodemailer';
import { sendEmail } from '../utils/emailSender';
import { cloudinaryUpload } from '../config/cloudinary';

export class UserController {
  async signUp(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const isExistUser = await prisma.user.findUnique({ where: { email: req.body.email } });
      if (isExistUser) {
        return ResponseHandller.error(res, `${isExistUser.email} is already exist, use other email address`, 400);
      }

      const user = await prisma.user.create({
        data: { ...req.body, password: await hashPassword(req.body.password) },
      });

      const authToken = sign({ id: user.id, email: user.email }, process.env.TOKEN_KEY || 'test', { expiresIn: '1h' });
      // await transporter.sendMail({
      //   from: 'Admin',
      //   to: req.body.email,
      //   subject: 'Verify your Account',
      //   html: `<div>
      //   <h1>Thank you ${req.body.name}, for registrater your account</h1>
      //   <p>klik link below to verify your account</p>
      //   <a href='http://localhost:3005/users/verify/${authToken}'>Verify Account</a>
      //   </div>`,
      // });

      await sendEmail(req.body.email, 'registration info', 'register.hbs', {
        name: req.body.username,
        link: `${process.env.FE_URL}/verify?a_t=${authToken}`,
      });

      return ResponseHandller.success(res, 'Your Sign up is success', 201);
    } catch (error: any) {
      return ResponseHandller.error(res, 'Your Sign up is failed', 500, error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const checkToken = res.locals.dcrypt;
      const findUser = await prisma.user.findUnique({ where: { id: checkToken.id } });

      if (!findUser) {
        throw {
          rc: 404,
          message: 'Account not found',
        };
      }

      const user = await prisma.user.update({
        where: { id: findUser.id },
        data: { isVerified: true },
      });

      return ResponseHandller.success(res, 'your account is verified');
    } catch (error: any) {
      next({
        rc: 500,
        message: 'Your Verification is failed',
        success: false,
        error: error.message,
      });
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
          imgProfile: findUser.imgprofile,
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
      console.log('at keep login from controller', res.locals.dcrypt);

      const findUser = await prisma.user.findUnique({
        where: { id: res.locals.dcrypt.id },
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
        imgProfile: findUser.imgprofile,
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
        where: { id: res.locals.dcrypt.id },
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

  async updatePhotoProfile(req: Request, res: Response, next: NextFunction): Promise<any> {
    console.log('file upload info', req.file);
    try {
      if (!req.file) {
        throw {
          rc: 400,
          message: 'no file exist',
        };
      }
      const { secure_url } = await cloudinaryUpload(req.file);
      console.log('console from cloudinary', secure_url);

      const update = await prisma.user.update({
        where: { id: parseInt(res.locals.dcrypt.id) },
        data: {
          imgprofile: secure_url,
        },
      });
      return ResponseHandller.success(res, 'upload profile is success', 200);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
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

      const authToken = sign({ email: findUser.email, id: findUser.id }, process.env.TOKEN_KEY || 'text', { expiresIn: '1h' });
      await sendEmail(findUser.email, 'Recover Your Password', 'forgot-password.hbs', {
        name: findUser.name,
        link: `${process.env.FE_URL}/recover-password?a_t=${authToken}`,
      });
      return ResponseHandller.success(res, 'an email sended to recover the password');
    } catch (error) {
      next(error);
    }
  }

  async recoverPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const token = res.locals.dcrypt;
      const findUser = await prisma.user.findUnique({ where: { id: token.id, email: token.email } });

      if (!findUser) {
        throw {
          rc: 404,
          message: 'account is not exist',
        };
      }

      await prisma.user.update({
        where: { id: findUser.id, email: findUser.email },
        data: {
          password: await hashPassword(req.body.password),
        },
      });

      return ResponseHandller.success(res, 'password is changed successfully');
    } catch (error) {
      next(error);
    }
  }
}
