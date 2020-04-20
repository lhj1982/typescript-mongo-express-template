import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/http.exception';
import { pp } from '../utils/stringUtil';
import logger from './logger.middleware';

function errorMiddleware(error: HttpException, request: Request, response: Response, next: NextFunction): any {
  console.log(`Error: ${error.stack}`);
  logger.error(`${pp(error)}, stack: ${error.stack}`);
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  const code = error.code || 'unknown_error';
  response
    .status(status)
    .send({
      status,
      code,
      message
    })
    .end();
}

export default errorMiddleware;
