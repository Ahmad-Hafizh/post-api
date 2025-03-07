import { Response } from 'express';

class ResponseHandller {
  success(res: Response, message: string, rc: number = 200, result?: any) {
    return res.status(rc).send({
      rc,
      message,
      success: true,
      result,
    });
  }

  error(res: Response, message: string, rc: number = 500, error?: any) {
    return res.status(rc).send({
      rc,
      message,
      success: false,
      error,
    });
  }
}
export default new ResponseHandller();
