// import { Request, Response as HttpResponse, NextFunction } from 'express';
import { Route, Get, Post, SuccessResponse, Tags, Body, Query, OperationId, Request, Response, Security } from 'tsoa';
import { IGetWechatDataRequest } from '../requests';
import { IResponse, IErrorResponse, IUserResponse } from '../responses';
import config from '../../config';

import { AccessDeniedException } from '../../exceptions/custom.exceptions';

import CouponService from '../svcs/coupon.service';
import EventService from '../svcs/event.service';
import UserService from '../svcs/user.service';
import OrderService from '../svcs/order.service';

@Route('/profile')
export class ProfileController {
  @Get('/')
  @Tags('profile')
  @OperationId('getProfile')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getMyProfile(@Request() req: any): Promise<IUserResponse> {
    // console.log(req);
    const { user: loggedInUser } = req;

    return { code: 'SUCCESS', data: loggedInUser };
  }

  @Get('/my-events')
  @Tags('profile')
  @OperationId('getMyEvents')
  @Security('access_token', ['user:getMyEvents'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getMyEvents(@Request() req: any, @Query('status') status?: string): Promise<IResponse> {
    const { user: loggedInUser } = req;
    if (!loggedInUser) {
      throw new AccessDeniedException('');
    }
    // const { status } = req.query;
    // default status filter
    let statusArr = ['ready', 'completed', 'expired'];
    if (status) {
      statusArr = status.split(',');
    }
    const events = await EventService.findEventsByUser(loggedInUser, statusArr);
    return { code: 'SUCCESS', data: events };
  }

  /**
   * Get token status of logged in user.
   *
   * @param {[type]} '/token-status' [description]
   */
  @Get('/token-status')
  @Tags('profile')
  @OperationId('getTokenStatus')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getTokenStatus(@Request() req: any): Promise<IResponse> {
    const { user: loggedInUser } = req;
    const { tokenIssuedAt, tokenExpiredAt } = loggedInUser;
    return {
      code: 'SUCCESSS',
      data: {
        tokenIssuedAt,
        tokenExpiredAt,
        userId: loggedInUser.id,
        openId: loggedInUser.openId
      }
    };
  }

  /**
   * Get wechat encrypted data, such as phoneNumber.
   *
   * @param {[type]} 'wechat-data' [description]
   */
  @Post('wechat-data')
  @Tags('profile')
  @OperationId('getWeChatData')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getPhoneEncryptedData(@Request() req: any, @Body() body: IGetWechatDataRequest): Promise<IResponse> {
    const { user: loggedInUser } = req;
    try {
      if (!loggedInUser) {
        throw new AccessDeniedException('');
      }
      // const { body } = req;
      const { appName } = body;
      // console.log(body);
      const response = await UserService.getWechatEncryptedData(config['appName'][appName]['appId'], body);
      // const result = {
      //   phoneNumber: response.phoneNumber,
      //   countryCode: response.countryCode
      // };
      return { code: 'SUCCESS', data: response };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get games open by DM or user has joined.
   *
   * @param {string} status status to filter
   */
  @Get('/my-games')
  @Tags('profile')
  @OperationId('getMyGames')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getMyGames(@Request() req: any, @Query('status') statusStr?: string): Promise<IResponse> {
    const { user: loggedInUser } = req;
    // const { status: statusStr } = req.query;
    try {
      let status = ['ready', 'completed'];
      if (statusStr) {
        status = statusStr.split(',');
      }
      const games = await UserService.getUserGames(loggedInUser, status);
      return { code: 'SUCCESS', data: games };
    } catch (err) {
      throw err;
    }
  }

  @Get('/my-online-scripts')
  @Tags('profile')
  @OperationId('getMyOnlineScripts')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getMyOnlineScripts(@Request() req: any): Promise<IResponse> {
    const { user: loggedInUser } = req;
    const { dmShop } = loggedInUser;

    try {
      let scripts = [];
      console.log(dmShop);
      if (dmShop) {
        const { onlineScripts } = dmShop;
        scripts = onlineScripts;
      }
      return { code: 'SUCCESS', data: scripts };
    } catch (err) {
      throw err;
    }
  }

  @Get('/my-coupons')
  @Tags('profile')
  @OperationId('getMyCoupons')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getMyCoupons(@Request() req: any, @Query('status') statusStr = 'active'): Promise<IResponse> {
    try {
      const status = statusStr.split(',');
      const { user: loggedInUser } = req;
      const coupons = await CouponService.getUserCoupons(loggedInUser, status);
      return { code: 'SUCCESS', data: coupons };
    } catch (err) {
      throw err;
    }
  }

  /**
   * @summary get last refundable order
   * @param {[type]} '/last-refundable-order' [description]
   */
  @Get('/last-refundable-order')
  @Tags('profile')
  @OperationId('getLastRefundableBooking')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getLastRefundableBooking(@Request() req: any): Promise<IResponse> {
    const { user: loggedInUser } = req;
    try {
      const result = await OrderService.getLastRefundableOrder(loggedInUser);
      return { code: 'SUCCESS', data: result };
    } catch (err) {
      throw err;
    }
  }
}
