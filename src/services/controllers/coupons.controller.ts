import { Route, Get, Controller, Post, BodyProp, Put, Delete, SuccessResponse, Tags, Body, Path, Query, OperationId, Request, Response, Security } from 'tsoa';
import { ICreateCouponRefunds } from '../requests';
import { IResponse, IErrorResponse, IUserResponse } from '../responses';
import GenericController from './generic.controller';
import config from '../../config';
import logger from '../../middleware/logger.middleware';

import { IUserCouponModel } from '../../data/repositories/coupon/userCoupon.model';
import CouponService from '../svcs/coupon.service';
import OrderService from '../svcs/order.service';

import { InvalidRequestException, ResourceNotFoundException, CouponCannotRefundException, AccessDeniedException } from '../../exceptions/custom.exceptions';

@Route('/coupons')
export class CounponsController extends GenericController {
  /**
   * Activate user coupon, only active coupon can be shown in user profile.
   *
   * @summary approve user coupon
   * @param {string} couponId coupon to activate
   */
  @Put('/{couponId}/activate')
  @Tags('coupon')
  @OperationId('approveCoupon')
  @Security('access_token', ['coupon:approveCoupon'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async activateCoupon(@Request() req: any, @Path('couponId') couponId: string): Promise<IResponse> {
    try {
      const { user: loggedInUser } = req;
      const userCoupon = await CouponService.findById(couponId);
      if (!userCoupon) {
        throw new ResourceNotFoundException('UserCoupon', couponId);
      }
      const { status, owner } = userCoupon;
      if (status !== 'created') {
        logger.error(`Invalid user coupon status (${status}) to approve.`);
        throw new InvalidRequestException('UserCoupon', ['couponId']);
      }
      if (!owner) {
        logger.error('The coupon is not own by anyone.');
        throw new InvalidRequestException('UserCoupon', ['couponId']);
      }
      const couponToUpdate = Object.assign(userCoupon, { status: 'active' });
      const newCoupon = await CouponService.saveOrUpdate(couponToUpdate);
      return { code: 'SUCCESS', data: newCoupon };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Create refunds from user coupons.
   * User click on UI to create refund.
   *
   * @summary create refunds from coupons.
   * @param {object} body request body
   */
  @Post('/create-refunds')
  @Tags('coupon')
  @OperationId('createCouponRefunds')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async createCouponRefunds(@Request() req: any, @Body() body: ICreateCouponRefunds): Promise<IResponse> {
    try {
      const { user: loggedInUser } = req;
      const { id: loggedInUserId } = loggedInUser;
      const { couponIds: couponIdsStr, orderId } = body;
      const order = await OrderService.findById(orderId);
      const couponIds = couponIdsStr.split(',');
      const promises = couponIds.map(async _ => {
        const coupon = await CouponService.findById(_);
        if (!coupon) {
          throw new ResourceNotFoundException('UserCoupon', _);
        }
        const {
          status,
          owner: { id: ownerId }
        } = coupon;
        if (status !== 'active') {
          logger.error(`Only active coupon can refund.`);
          throw new CouponCannotRefundException(_);
        }
        if (loggedInUserId !== ownerId) {
          throw new AccessDeniedException(loggedInUserId, `You are not allow to create refund for coupon ${_}`);
        }
        return coupon;
      });
      const coupons = await Promise.all(promises);
      const refunds = await CouponService.createRefunds(loggedInUser, order, coupons);
      return { code: 'SUCCESS', data: refunds };
    } catch (err) {
      throw err;
    }
  }
}
