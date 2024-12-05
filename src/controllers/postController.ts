import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import ResponseHandler from '../utils/responseHandler';

export class PostController {
  async getPost(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const query: any = req.query;
      if (query.post_id) query.post_id = parseInt(query.post_id);
      if (query.author_id) query.author_id = parseInt(query.author_id);

      const posts = await prisma.post.findMany({
        where: query,
      });

      if (!posts) {
        throw {
          rc: 404,
          message: 'Data not found',
        };
      }

      return ResponseHandler.success(res, 'Your get Post is Success', 200, posts.length == 1 ? posts[0] : posts);
    } catch (error: any) {
      next({
        rc: error.rc || 500,
        message: 'Your get post is failed',
        success: false,
        error: error.message,
      });
    }
  }

  async addPostData(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const post = await prisma.post.create({
        data: req.body,
      });

      return ResponseHandler.success(res, 'Your post is posted', 201, post);
    } catch (error: any) {
      next({
        rc: 500,
        message: 'Your post is failed to posts',
        success: false,
        error: error.message,
      });
    }
  }

  async updatePostData(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const post = await prisma.post.update({
        where: { post_id: parseInt(req.params.id) },
        data: req.body,
      });

      return ResponseHandler.success(res, 'Your post is updated', 201, post);
    } catch (error: any) {
      next({
        rc: 500,
        message: 'Your post is failed to update',
        success: false,
        error: error.message,
      });
    }
  }
}

export const getPostData = async (req: Request, res: Response) => {
  try {
    const query: any = req.query;
    if (query.post_id) query.post_id = parseInt(query.post_id);
    if (query.author_id) query.author_id = parseInt(query.author_id);

    const posts = await prisma.post.findMany({
      where: query,
    });

    res.status(200).send(posts.length == 1 ? posts[0] : posts);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const addPostData = async (req: Request, res: Response) => {
  try {
    const post = await prisma.post.create({
      data: req.body,
    });
    res.status(200).send(post);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const updatePostData = async (req: Request, res: Response) => {
  try {
    const post = await prisma.post.update({
      where: { post_id: parseInt(req.params.id) },
      data: req.body,
    });
    res.status(200).send(post);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const deletePostData = async (req: Request, res: Response) => {
  try {
    const post = await prisma.post.delete({
      where: { post_id: parseInt(req.params.id) },
    });
    res.status(200).send(post);
  } catch (error) {
    res.status(500).send(error);
  }
};
