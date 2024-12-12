import dotenv from 'dotenv';
dotenv.config();
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import ResponseHandler from './utils/responseHandler';
import { UserRouter } from './route/userRouter';
import { PostRouter } from './route/postRouter';
import path from 'path';
import scheduleTask from './cron/scheduleTask';
import redisClient from './config/redis';

const PORT = process.env.PORT || 8082;

class App {
  readonly app: Application;

  constructor() {
    this.app = express(); //define express
    this.configure(); // running configure
    this.routes(); //running routes
    this.errorHandler(); // running error handler
  }

  private configure(): void {
    this.app.use(cors());
    this.app.use(express.json());
    // middleware for direct access directory
    this.app.use('/', express.static(path.join(__dirname, '../public')));
    // scheduleTask();
  }

  private routes(): void {
    const userRouter = new UserRouter();
    const postRouter = new PostRouter();
    this.app.get('/', (req: Request, res: Response): any => {
      return res.status(200).send('ORM API');
    });
    this.app.use('/users', userRouter.getRouter());
    this.app.use('/posts', postRouter.getRouter());
  }

  private errorHandler(): void {
    this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      ResponseHandler.error(res, error.message, error.error, error.rc);
    });
  }

  public async start(): Promise<void> {
    await redisClient.connect(); //connect to redis
    this.app.listen(PORT, () => {
      console.log('API running at', PORT);
    });
  }
}

export default App;
