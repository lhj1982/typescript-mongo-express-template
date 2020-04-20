import { Route, Get, Post, Put, SuccessResponse, Tags, Body, Path, Query, OperationId, Request, Response, Security } from 'tsoa';
import { ICreateRefundRequest, IUpdateRefundRequest } from '../requests';
import { IResponse, IErrorResponse } from '../responses';
import logger from '../../middleware/logger.middleware';
import config from '../../config';
import GenericController from './generic.controller';

// import RefundsRepo from '../../data/repositories/refund/refunds.repository';
// import OrdersRepo from '../../data/repositories/order/orders.repository';
import EventService from '../svcs/event.service';
import MemberService from '../svcs/member.service';
import RefundService from '../svcs/refund.service';
import OrderService from '../svcs/order.service';
import CouponService from '../svcs/coupon.service';
import {
  InvalidRequestException,
  ResourceNotFoundException,
  AccessDeniedException,
  OrderCannotPayException,
  OrderAlreadyPaidException,
  CannotRefundException
} from '../../exceptions/custom.exceptions';
import { pp } from '../../utils/stringUtil';

/**
 * Ger orders list.
 *
 * @param {[type]} 'orders' [description]
 */
@Route('orders')
export class OrdersController extends GenericController {
  @Get()
  @Tags('order')
  @OperationId('getOrders')
  @Security('access_token', ['order:getOrders'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getOrders(@Request() req: any, @Query('tradeNo') outTradeNo?: string, @Query('limit') limit?: number, @Query('offset') offset?: number): Promise<IResponse> {
    // let offset = parseInt(req.query.offset);
    // let limit = parseInt(req.query.limit);
    // const { tradeNo: outTradeNo } = req.query;
    if (!offset) {
      offset = config.query.offset;
    }
    if (!limit) {
      limit = config.query.limit;
    }
    try {
      let result = await OrderService.searchOrders({
        outTradeNo,
        limit,
        offset
      });
      const links = this.generateLinks(result.pagination, req.originalUrl, '');
      result = Object.assign({}, result, links);
      return { code: 'SUCCESS', data: result };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Pay an order. For wechat pay, it generates prepay id and don't confirm the payment until received the payment callback.
   *
   * @param {[type]} '/{orderId}/pay' [description]
   */
  @Post('/{orderId}/pay/{appName}')
  @Tags('order')
  @OperationId('payOrder')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async payOrder(@Request() req: any, @Path('orderId') orderId: string, @Path('appName') appName: string): Promise<IResponse> {
    const {
      user: { id: loggedInUserId }
    } = req;
    // const { orderId } = req.params;
    try {
      const order = await OrderService.findById(orderId);
      if (!order) {
        throw new ResourceNotFoundException('Order', orderId);
      }
      const {
        orderStatus,
        createdBy: { id: createdByUserId }
      } = order;
      if (orderStatus != 'created') {
        throw new OrderCannotPayException(orderId);
      }
      // console.log(loggedInUserId);
      // console.log(createdByUserId);
      if (loggedInUserId != createdByUserId) {
        throw new AccessDeniedException(loggedInUserId, `You can only pay your own order`);
      }

      const newOrder = await OrderService.payOrder(order, appName);
      return { code: 'SUCCESS', data: newOrder };
    } catch (err) {
      throw err;
    }
  }

  /**
   * * Depends on order status, we should
   * <ul>
   * <li> 1. if event_join, update order status to paid, update eventUser to paid
   * <li> 2. if member_card_purchase, update order status to paid, update member expired date, update member card status.
   * </ul>
   * @summary wechat pay notify callback.
   *
   * @param {object} body payment notify payload from wechat
   */
  @Post('/wechat/pay_callback')
  @Tags('order')
  @OperationId('notifyWechatPayCallback')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async confirmWechatPayment(@Request() body: any): Promise<IResponse> {
    const { body: bodyInJson } = body;
    // const { body } = req;
    logger.info(`wechat payment notify ${bodyInJson}`);
    const session = await OrderService.getSession();
    session.startTransaction();
    try {
      const opts = { session };
      const payment = await OrderService.confirmWechatPayment(bodyInJson);
      const { outTradeNo } = payment;
      const order = await OrderService.findByTradeNo(outTradeNo);
      if (!order) {
        await session.abortTransaction();
        await OrderService.endSession();
        throw new ResourceNotFoundException('Order', outTradeNo);
      }
      const { orderStatus, _id } = order;
      if (orderStatus != 'created') {
        throw new OrderAlreadyPaidException(_id);
        await session.abortTransaction();
        await OrderService.endSession();
        return;
      }
      const orderToUpdate = Object.assign(order.toObject(), {
        orderStatus: 'paid',
        payment
      });
      const newOrder = await OrderService.updatePaymentStatus(orderToUpdate, opts);
      const { type, objectId } = order;
      if (type === 'event_join') {
        logger.info(`Updating eventUser payment status, ${objectId}`);
        await EventService.updateBookingPaymentStatus(objectId, opts);
      } else if (type === 'member_card_purchase') {
        logger.info(`Updating member card payment status and member status, ${objectId}`);
        await MemberService.updateMemeberStatusPerPayment(objectId, opts);
      }

      await session.commitTransaction();
      await OrderService.endSession();
      return { code: 'SUCCESS', data: newOrder };
    } catch (err) {
      await session.abortTransaction();
      await OrderService.endSession();
      logger.error(err);
      throw err;
    }
  }

  /**
   * Get order payment status.
   *
   * @param {[type]} '/{orderId}/pay-status' [description]
   */
  @Get('/{orderId}/pay-status/{appName}')
  @Tags('order')
  @OperationId('getOrderPaymentStatus')
  @Security('access_token', ['order:getOrderPaymentStatus'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async queryPaymentStatus(@Request() req: any, @Path('orderId') orderId: string, @Path('appName') appName: string): Promise<IResponse> {
    // const { user: loggedInUser } = req;
    // const { orderId } = req.params;
    try {
      const order = await OrderService.findById(orderId);
      if (!order) {
        throw new ResourceNotFoundException('Order', orderId);
      }

      const response = await OrderService.queryPaymentStatus(order, appName);
      return { code: 'SUCCESS', data: response };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * Go through all orders which are marked as refund_requested, and call refund. This is run by cronjob.
   *
   * @param {Request}      req  [description]
   * @param {Response}     res  [description]
   * @param {NextFunction} next [description]
   */
  @Post('/refund/{appName}')
  @Tags('order')
  @OperationId('batchRefund')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async refundOrders(@Path('appName') appName: string): Promise<IResponse> {
    const session = await OrderService.getSession();
    session.startTransaction();
    try {
      if (!appName) {
        throw new InvalidRequestException('RefundOrders', ['appName']);
      }
      const opts = { session };
      const refunds = await OrderService.refundOrders(appName, opts);
      await session.commitTransaction();
      await OrderService.endSession();
      return { code: 'SUCCESS', data: refunds };
    } catch (err) {
      await session.abortTransaction();
      await OrderService.endSession();
      throw err;
    }
  }

  // *
  //  * Create a refund record from an order. The amount of refund depends on how many coupons it attaches.
  //  *
  //  * @param {Request}      req  [description]
  //  * @param {Response}     res  [description]
  //  * @param {NextFunction} next [description]

  /**
   * Create an order refund, amount of refund depends on how much the coupons value.
   *
   * @param {[type]} '/{orderId}/refund' [description]
   */
  @Post('/{orderId}/refund')
  @Tags('order')
  @OperationId('createRefund')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async refundOrder(@Request() req: any, @Path('orderId') orderId: string, @Body() body: ICreateRefundRequest): Promise<IResponse> {
    const { user: loggedInUser } = req;
    // const { id: loggedInUserId } = loggedInUser;
    // const { orderId } = req.params;
    const { coupons: couponIds } = body;
    try {
      const order = await OrderService.findById(orderId);
      if (!order) {
        throw new ResourceNotFoundException('Order', orderId);
      }
      if (!couponIds) {
        throw new InvalidRequestException('Order', ['coupons']);
      }

      const coupons = await CouponService.getCoupons(couponIds);
      const amount = await OrderService.getRefundAmount(loggedInUser, coupons);
      console.log(amount);
      const { amount: orderAmount } = order;
      if (amount === 0 || amount > orderAmount) {
        throw new CannotRefundException(orderId, `You cannot refund ${amount}`);
      }

      const refund = await OrderService.refund(order, coupons, amount);
      return { code: 'SUCCESS', data: refund };
    } catch (err) {
      throw err;
    }
  }

  /**
   * wechat refund notify callback.
   * 
   * payment notify status: {"return_code":["SUCCESS"],"appid":["wxf59749a45686779c"],"mch_id":["1560901281"],"nonce_str":["8010b252d85da496c326787c8aa9920c"],"req_info":["LR3HUI1qW+C5FaIAP/Q44K3R7aIhafRcLRcRfuxZZ9nkM+RKM6k0QeTaJgoH6yZghnQGsHDQUAY9h5GyhZ0/XbZKABO2VhbfI2gMsCuPBffo7NmlNTvcMpqTX1fkAncYVQjk9vlQXZtdA5CBXOtpcw2Em6X36Rp20I16YlbMmVWEzip/JLAYohZMVo0K4Jt6LMofFPfTMn7tdS/VzQ/ezT7YmVAMmm82p3HMTA81gN8tMIW7L/ZmHF67iN6viMTsF+le5V0WG9OVOpRYuj2iHvGy183JK4W8DPkcmVtwTu/j8h7zTWA8H76P1A7Hb/rd31auYE6LkNDz+TgWNAOgNMNsnXaz2YNfJOwag7WYN6pSCTDOA6hk+xnY4X19BcaELA7X3RXJLS4GQiLcVbXSylTMHzZnoHO1M9Sn0jOpQtpV3yjYms/vUXzDRsNafVnfItmaM05mg0FfoW1fGOmhfRL7RjFBIFyLeq8QwptFDAFTTQutwMFHGiXGeN5VJq01Rlfb9UbGpEobwOGALWVSBgN9SVYOpORUuznbscZPhSP5lRjnG64qhLsoapywCBDMAtbi/5V35iinjz5I/2uDpYIkhXoJzJnnrGtAxDVCOZcTjbRvWGFCt+459m4H0kiE1Da1quAlIsBp12WPQtZhAlAmo/FOd5kbKrodn0OWIPieQAlwZs7ZlZ1W0NXEaPedn4MoEoWwyzEmoI4Yu8gXXt9MocvoLSaGRQa9vsIpYKkjJWoR9wqcNLTmM+peNVgDD3aUTxOAxPixejcFuxSjWRZXDtxkHDvcYsJpAK471xYZsUSF2evPhb6Rgc5qn8BPnGIxZOoVotGmJQiFsNPFBRaS91OtaJLymmgOsp+9SBuaa/ChwvHLS1k5WatWsiffbk3IponOtbvgPu+cPLWA5MKiNWl7eMJfdF5CSXOfLVIjMW4ZExaLfEi1BOMqsjNUp1ad2M9XnGeULb+l9RNjErQw4zbVLh8HkeNCEWxzzCMAIgUdv89cxhtpgh9Jbu1mrUmB3S3wjJ8pKRBvwXW+6unEDSaEWRS7Z9DmEsJYhANeW79iPBzYqYgSsCMyogO6S/ISH5r8HvMrljK9n+Q3Qw=="]}

   * @param {Request}      req  [description]
   * @param {Response}     res  [description]
   * @param {NextFunction} next [description]
   */
  @Post('/wechat/refund_callback')
  @Tags('order')
  @OperationId('notifyWechatRefundCallback')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async confirmWechatRefund(@Body() body: any): Promise<IResponse> {
    // const { body } = req;
    const { body: bodyInJson } = body;
    logger.info(`wechat refund notify ${pp(bodyInJson)}`);
    const refundData = await OrderService.confirmWechatRefund(bodyInJson);
    // console.log(refundData);
    // const { outRefundNo, refundStatus } = refundData;
    try {
      const newRefund = RefundService.confirmWechatRefund(refundData);
      return { code: 'SUCCESS', data: newRefund };
    } catch (err) {
      throw err;
    }
  }

  @Put('/{orderId}/refund/{refundId}')
  @Tags('order')
  @OperationId('updateRefund')
  @Security('access_token', ['order:updateRefund'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async updateRefund(@Request() req: any, @Path('orderId') orderId: string, @Path('refundId') refundId: string, @Body() body: IUpdateRefundRequest): Promise<IResponse> {
    // const { user: loggedInUser } = req;
    // const { orderId, refundId } = req.params;
    const { status } = body;
    try {
      const refund = await OrderService.updateRefund(orderId, refundId, {
        status
      });
      return { code: 'SUCCESS', data: refund };
    } catch (err) {
      throw err;
    }
  }
}
