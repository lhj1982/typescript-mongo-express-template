import { UserModel } from '../../data/models/user';
import { Route, Get, Controller, Post, BodyProp, Put, Delete, SuccessResponse, Tags, Body, OperationId, Response, Security } from 'tsoa';
// import { description } from 'joi';
import { IRUserw, IResponse } from '../responses';

@Route('/user')
export class RegisterController extends Controller {
  // /**
  //  * This is a description of the register user method
  //  */
  // @Post('/register')
  // @Tags('Users')
  // @OperationId('registerUser')
  // @Response<IResponse>('400', 'Bad Request')
  // @SuccessResponse('200', 'OK')
  // public async createUser(@Body() body: IRUserw): Promise<IResponse> {
  //   try {
  //     const user = new UserModel(body);
  //     await user.save();
  //     const response = {
  //       message: 'ok',
  //       status: '200',
  //       data: body
  //     };
  //     return response;
  //   } catch (err) {
  //     this.setStatus(400);
  //     const response = {
  //       message: 'fail',
  //       status: '400',
  //       data: err
  //     };
  //     return response;
  //   }
  // }
  // /**
  //  * This is a description of the authenticate user method
  //  */
  // @Post('/authenticate')
  // @Tags('Users')
  // @OperationId('registerUser')
  // @Response<IResponse>('400', 'Bad Request')
  // @SuccessResponse('200', 'OK')
  // public async authUser(@Body() body: IRUserw): Promise<IResponse> {
  //   try {
  //     const user = new UserModel(body);
  //     await user.save();
  //     const response = {
  //       message: 'ok',
  //       status: '200',
  //       data: body
  //     };
  //     return response;
  //   } catch (err) {
  //     this.setStatus(400);
  //     const response = {
  //       message: 'fail',
  //       status: '400',
  //       data: err
  //     };
  //     return response;
  //   }
  // }
  // @Post('/authenticate1')
  // @Tags('Users')
  // @OperationId('registerUser')
  // @Response<IResponse>('400', 'Bad Request')
  // @SuccessResponse('200', 'OK')
  // public async authUser1(@Body() body: IRUserw): Promise<IResponse> {
  //   try {
  //     const user = new UserModel(body);
  //     await user.save();
  //     const response = {
  //       message: 'ok',
  //       status: '200',
  //       data: body
  //     };
  //     return response;
  //   } catch (err) {
  //     this.setStatus(400);
  //     const response = {
  //       message: 'fail',
  //       status: '400',
  //       data: err
  //     };
  //     return response;
  //   }
  // }
}
