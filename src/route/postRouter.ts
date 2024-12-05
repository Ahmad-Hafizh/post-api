import { Router } from 'express';
import { PostController } from '../controllers/postController';

export class PostRouter {
  private route: Router;
  private postController: PostController;

  constructor() {
    this.postController = new PostController();
    this.route = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route.get('/', this.postController.getPost);
    this.route.post('/', this.postController.addPostData);
    this.route.patch('/:id', this.postController.updatePostData);
  }

  public getRouter(): Router {
    return this.route;
  }
}
