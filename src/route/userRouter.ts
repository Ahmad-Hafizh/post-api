import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { verifyToken } from '../middleware/verifyToken';
import { regisValidation } from '../middleware/validator';

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
  }

  public getRouter(): Router {
    return this.route;
  }
}
