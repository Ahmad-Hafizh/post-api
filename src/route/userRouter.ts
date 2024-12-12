import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { verifyToken } from '../middleware/verifyToken';
import { regisValidation } from '../middleware/validator';
import { uploader, uploaderMemory } from '../middleware/uploader';
import express, { Application, Request, Response, NextFunction } from 'express';

export class UserRouter {
  private route: Router;
  private userController: UserController;

  constructor() {
    this.userController = new UserController();
    this.route = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route.post('/signup', regisValidation, this.userController.signUp);
    this.route.post('/signin', this.userController.signIn);
    this.route.get('/keep-login', verifyToken, this.userController.keepLogin);
    // this.route.patch('/photo-profile', verifyToken, uploader('/profile', 'PRF').single('imgProfile'), this.userController.updatePhotoProfile);
    this.route.patch('/photo-profile', verifyToken, uploaderMemory().single('imgProfile'), this.userController.updatePhotoProfile);
    this.route.patch('/verify-account', verifyToken, this.userController.verifyEmail);
    this.route.post('/forgot-password', this.userController.forgotPassword);
    this.route.patch('/recover-password', verifyToken, this.userController.recoverPassword);

    // test
    this.route.get('/test', (req: Request, res: Response): any => {
      return res.status(200).send('ORM API');
    });
  }

  public getRouter(): Router {
    return this.route;
  }
}
