import config from '../../config';
const axios = require('axios');
const fs = require('fs');
import logger from '../../middleware/logger';

import { IScriptModel } from '../../data/repositories/script/script.model';
import { IShopModel } from '../../data/repositories/shop/shop.model';
import { IUserModel } from '../../data/repositories/user/user.model';
import { IEventModel } from '../../data/repositories/event/event.model';
import { IEventUserModel } from '../../data/repositories/event/eventUser.model';
import { IAddEventRequest } from '../requests/addEvent.request';

// import FileService from './file.service';
// import OrderService from './order.service';
import CommonService from './common.service';
import UserService from './user.service';
import MessageService from './message.service';
import CacheService from './cache.service';
import { nowDate, addDays2, string2Date, formatDate, addDays, add, getDate } from '../../utils/dateUtil';
import { pp, getRandomString } from '../../utils/stringUtil';
import EventsRepo from '../../data/repositories/event/events.repository';
import DiscountRulesMapRepo from '../../data/repositories/discount-rule/discountRulesMap.repository';
// import OrdersRepo from '../repositories/orders.repository';
// import RefundsRepo from '../repositories/refunds.repository';
import EventUsersRepo from '../../data/repositories/event/eventUsers.repository';
import UsersRepo from '../../data/repositories/user/users.repository';
import User from '../../data/repositories/user/users.repository';
// import UserCouponsRepo from '../repositories/userCoupons.repository';
// import UserInvitationsRepo from '../repositories/userInvitations.repository';
import { ResourceNotFoundException, EventCannotCreateException } from '../../exceptions/custom.exceptions';

class EventService extends CommonService {
  async findById(id: string, filter = { status: ['ready', 'completed', 'expired'] }) {
    const event = await EventsRepo.findById(id, filter);
    if (!event) {
      throw new ResourceNotFoundException('Event', id);
    }
    const { _id, script } = event;
    if (!script) {
      logger.warn(`No online script is found for event: ${id}`);
      return undefined;
    }
    return event;
  }

  async addEvent(script: IScriptModel, shop: IShopModel, hostUser: IUserModel, loggedInUser: IUserModel, data: IAddEventRequest): Promise<any> {
    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };
      const { shopId, scriptId, startTime, endTime, hostUserId, hostComment, numberOfPlayers, price, hostUserMobile, hostUserWechatId } = data;
      let { numberOfOfflinePlayers, isHostJoin, supportPayment } = data;
      const { minNumberOfSpots, maxNumberOfSpots } = script;
      if (!numberOfOfflinePlayers) {
        numberOfOfflinePlayers = 0;
      }
      // console.log(typeof isHostJoin !== 'undefined');
      if (typeof isHostJoin === 'undefined') {
        isHostJoin = true;
      }
      // if (!isHostJoin) {
      //   isHostJoin = true;
      // }

      const minNumberOfAvailableSpots = minNumberOfSpots - numberOfOfflinePlayers;
      const maxNumberOfAvailableSpots = maxNumberOfSpots - numberOfOfflinePlayers;
      // const numberOfPlayers = 0;
      let newEvent;
      let newOrder;

      const { duration } = script;

      const dtStartTime = formatDate(startTime, config.eventDateFormatParse);
      const dtEndTime = add(startTime, duration, 'm');
      // update host user mobile and wechat if user does not have mobile
      const userToUpdate = Object.assign(hostUser, {
        mobile: hostUserMobile,
        wechatId: hostUserWechatId
      });
      await UsersRepo.saveOrUpdateUser(userToUpdate, opts);

      const applicableDiscountRules = await this.generateAvailableDiscountRules(scriptId, shopId, startTime);
      let discountRule = undefined;
      if (applicableDiscountRules.length > 0) {
        if (applicableDiscountRules.length > 1) {
          throw new EventCannotCreateException([shopId, scriptId, startTime, hostUserId]);
          return;
        }
        discountRule = applicableDiscountRules[0];
      }
      if (typeof supportPayment === 'undefined') {
        supportPayment = this.isPaymentSupported(shop);
      }

      newEvent = await EventsRepo.saveOrUpdate(
        {
          shop: shopId,
          script: scriptId,
          startTime: dtStartTime,
          endTime: dtEndTime,
          hostUser: hostUserId,
          hostUserMobile,
          hostUserWechatId,
          hostComment,
          minNumberOfSpots,
          maxNumberOfSpots,
          numberOfOfflinePlayers,
          numberOfPlayers,
          minNumberOfAvailableSpots,
          maxNumberOfAvailableSpots,
          price,
          discountRule,
          isHostJoin,
          status: 'ready',
          supportPayment,
          createdAt: new Date()
        },
        opts
      );

      // console.log(newEvent);
      if (isHostJoin) {
        const newEventUser = await EventUsersRepo.saveOrUpdate(
          {
            event: newEvent.id,
            user: hostUserId,
            source: 'online',
            mobile: hostUserMobile,
            wechatId: hostUserWechatId,
            status: 'unpaid',
            createdAt: nowDate(),
            invitor: hostUserId // if host join event, sent invitor himself automatically
          },
          opts
        );
        // if (supportPayment) {
        //   const order = {
        //     createdBy: hostUserId,
        //     type: 'event_join',
        //     amount: (price * 100).toFixed(),
        //     objectId: newEventUser.id,
        //     outTradeNo: getRandomString(32),
        //     orderStatus: 'created'
        //   };
        //   newOrder = await OrderService.createOrder(order, opts);
        // }
      }
      newEvent = Object.assign(newEvent.toObject(), {
        shop,
        script,
        hostUser: loggedInUser
      });
      // logger.info(`Added event ${pp(newEvent)}`);
      // console.log(newEvent);
      // save notifications in db and send sms if necessary
      await MessageService.saveNewEventNotifications(newEvent, opts);
      await session.commitTransaction();
      await this.endSession();
      // await CacheService.purgeEventCache(newEvent, req);
      // get participators for given event
      const eventUsers = await EventUsersRepo.findByEvent(newEvent.id);
      newEvent = await this.updateEventParticpantsNumber(newEvent, eventUsers);
      return Object.assign(newEvent.toObject(), { order: newOrder });
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }

  /**
   * Update event participants stats.
   *
   * @param {[type]} event      [description]
   * @param {[type]} eventUsers [description]
   */
  updateEventParticpantsNumber = async (event: IEventModel, eventUsers: IEventUserModel[]) => {
    const { minNumberOfSpots, maxNumberOfSpots, numberOfOfflinePlayers } = event;
    let { minNumberOfAvailableSpots, maxNumberOfAvailableSpots, numberOfPlayers } = event;
    if (!minNumberOfAvailableSpots) {
      minNumberOfAvailableSpots = 0;
    }
    if (!maxNumberOfAvailableSpots) {
      maxNumberOfAvailableSpots = 0;
    }
    if (!numberOfPlayers) {
      numberOfPlayers = 0;
    }
    numberOfPlayers = eventUsers.length;
    minNumberOfAvailableSpots = minNumberOfSpots - numberOfPlayers - numberOfOfflinePlayers;
    if (minNumberOfAvailableSpots < 0) {
      minNumberOfAvailableSpots = 0;
    }
    maxNumberOfAvailableSpots = maxNumberOfSpots - numberOfPlayers - numberOfOfflinePlayers;
    if (maxNumberOfAvailableSpots < 0) {
      maxNumberOfAvailableSpots = 0;
    }
    const eventToUpdate = Object.assign(event, {
      minNumberOfAvailableSpots,
      maxNumberOfAvailableSpots,
      numberOfPlayers,
      numberOfOfflinePlayers
    });
    const newEvent = await EventsRepo.saveOrUpdate(eventToUpdate, {});
    return newEvent;
  };

  // async getQrCode(appName: string, eventId: string) {
  //   const time2 = 0,
  //     accessToken = '';
  //   const time1 = new Date().getTime();
  //   if (!time2 && time1 - time2 > 7000) {
  //     try {
  //       const response = await axios.get(
  //         `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config['appName'][appName]['appId']}&secret=${config['appName'][appName]['appSecret']}`
  //       );
  //       const {
  //         data: { access_token: accessToken }
  //       } = response;
  //       const imageData = await this.getwxcode(accessToken, eventId);

  //       const base64Str = Buffer.from(imageData, 'binary').toString('base64');
  //       const uploadResp = await FileService.uploadFileBase64(`static/images/events/qrcode/${eventId}.png`, base64Str);
  //       return uploadResp;
  //     } catch (err) {
  //       if (err.error == 'file exists') {
  //         const uploadResp = {
  //           hash: '',
  //           key: `static/images/events/qrcode/${eventId}.png`
  //         };
  //         return uploadResp;
  //       }
  //       logger.error(err);
  //       throw err;
  //     }
  //     // }
  //   }
  // }

  // async getwxcode(accessToken: string, eventId: string) {
  //   //方法2： 利用request模块发起请求
  //   const postData = {
  //     page: 'pages/event_detail', //二维码默认打开小程序页面
  //     scene: eventId,
  //     width: 100,
  //     auto_color: false
  //   };
  //   // postData = JSON.stringify(postData);
  //   const response = await axios({
  //     responseType: 'arraybuffer',
  //     method: 'POST',
  //     url: `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
  //     headers: {
  //       'Content-Type': 'image/png'
  //     },
  //     data: JSON.stringify(postData)
  //   });
  //   const { data } = response;
  //   return data;
  // }

  // /**
  //  * Rules for cancel bookings, for both cancelled event and event which its price has updated
  //  *
  //  * 1. find all paid eventUsers for given event
  //  * 2. Mark them as unpaid + statusNote
  //  * 3. Mark all paid orders for those bookings to refund_requested
  //  *
  //  * @param {[type]} event   [description]
  //  * @param {{}}   options [description]
  //  */
  // async cancelBookings(event, statusNote: string, refundDesc: string, immediateRefund = false, options: {}) {
  //   const { id } = event;
  //   const eventUsers = await EventUsersRepo.findByEvent(id, {
  //     status: ['paid']
  //   });
  //   // console.log(eventUsers);
  //   // find all paid orders and mark them as refund
  //   const refundedOrders = [];
  //   for (let i = 0; i < eventUsers.length; i++) {
  //     const eventUser = eventUsers[i];
  //     try {
  //       const order = await this.cancelBooking(eventUser, refundDesc, immediateRefund, options);
  //       await this.markEventUsersUnpaid(eventUser, statusNote, options);
  //       if (order) {
  //         refundedOrders.push(order);
  //       }
  //     } catch (err) {
  //       logger.error(err);
  //     }
  //   }
  //   logger.info(`Found orders to be refunded, ${pp(refundedOrders)}`);
  //   return refundedOrders;
  // }

  // async cancelBooking(eventUser: any, refundDesc: string, immediateRefund = false, options: any) {
  //   const {
  //     user: { id: createdBy },
  //     id: objectId
  //   } = eventUser;
  //   const params = {
  //     createdBy,
  //     type: 'event_join',
  //     objectId,
  //     orderStatus: 'paid'
  //   };
  //   // console.log(params);
  //   // console.log(params);
  //   const order = await OrdersRepo.findByParams(params);
  //   // console.log(orders);
  //   if (order) {
  //     const { amount, outTradeNo, _id } = order;
  //     // console.log('ssss');
  //     await OrdersRepo.updateStatus(params, { orderStatus: 'refund' }, options);
  //     await RefundsRepo.saveOrUpdate(
  //       {
  //         order: _id,
  //         user: createdBy,
  //         totalAmount: amount,
  //         refundAmount: amount,
  //         outTradeNo,
  //         outRefundNo: getRandomString(32),
  //         refundDesc,
  //         type: 'refund',
  //         status: immediateRefund ? 'approved' : 'created',
  //         createdAt: nowDate()
  //       },
  //       options
  //     );
  //     return order;
  //   } else {
  //     logger.warn(`No paid order is found, ${pp(params)}, no need to process`);
  //     return undefined;
  //   }
  // }

  // async markEventUsersUnpaid(eventUser, statusNote, options) {
  //   const eventUserToUpdate = Object.assign(eventUser.toObject(), {
  //     status: 'unpaid',
  //     statusNote
  //   });
  //   return await EventUsersRepo.update(eventUserToUpdate, options);
  // }

  hasException = (startTime: string, discountRule): boolean => {
    const { _id, exception } = discountRule;
    const formattedDate = getDate(startTime);
    let hasException = false;
    if (exception) {
      const { dates } = exception;
      if (dates.indexOf(formattedDate) !== -1) {
        logger.warn(`Found exception for rule: ${_id}, startTime: ${startTime}`);
        hasException = true;
      }
    }
    return hasException;
  };

  getAvailableDiscountRulesFromDB = async (scriptId: string, shopId: string, startTime: string = undefined): Promise<any> => {
    let result = await DiscountRulesMapRepo.findByShopAndScript(shopId, scriptId, startTime);
    if (result.length === 0) {
      result = await DiscountRulesMapRepo.findByShopAndScript(shopId, undefined, startTime);
    }
    return result;
  };

  generateAvailableDiscountRules = async (scriptId: string, shopId: string, startTime: string = undefined) => {
    const availableDiscountRulesRaw = await this.getAvailableDiscountRulesFromDB(scriptId, shopId, startTime);
    // console.log(availableDiscountRulesRaw);
    const availableDiscountRules = availableDiscountRulesRaw
      .filter(rule => {
        const { discountRule } = rule;
        // console.log(startTime);
        // console.log(rule);
        return discountRule != null && !this.hasException(startTime, discountRule);
      })
      .map(rule => {
        // console.log(rule);
        const { discountRule } = rule;
        return discountRule;
      });
    logger.info(`Found available discountRules, ${availableDiscountRules}, for script ${scriptId}, shopId ${shopId}, startTime ${startTime}`);
    return availableDiscountRules;
  };

  isPaymentSupported(shop: IShopModel): boolean {
    const { supportedPaymentMethods } = shop;
    if (supportedPaymentMethods && supportedPaymentMethods.length > 0 && supportedPaymentMethods.indexOf('wechat') != -1) {
      return true;
    }
    return false;
  }

  // async archiveEvents() {
  //   const session = await EventsRepo.getSession();
  //   session.startTransaction();
  //   try {
  //     const opts = { session };
  //     const result = await EventsRepo.archiveEvents(opts);
  //     const { eventIds } = result;
  //     const promises = eventIds.map(async eventId => {
  //       const event = await EventsRepo.findById(eventId);
  //       const { supportPayment } = event;
  //       let response = undefined;
  //       if (supportPayment) {
  //         logger.info(`Event is payment enabled, cancel all payments if exist for expired events`);
  //         response = await this.cancelBookings(event, 'event_cancelled', '退款 - 发团过期', true, opts);
  //       }
  //       return response;
  //     });
  //     await Promise.all(promises);
  //     await session.commitTransaction();
  //     await EventsRepo.endSession();
  //     return result;
  //   } catch (err) {
  //     await session.abortTransaction();
  //     await EventsRepo.endSession();
  //     throw err;
  //   }
  // }

  // async inviteUser(invitor: any, event: any, inviteeMobile: string): Promise<any> {
  //   const { id: invitorUserId } = invitor;
  //   const { id: eventId } = event;
  //   const now = nowDate();
  //   const expiredAt = addDays2(now, config.event.invitationDuration);
  //   const invitationToAdd = {
  //     invitor: invitorUserId,
  //     objectId: eventId,
  //     type: 'event_user_invitation',
  //     inviteeMobile,
  //     invitationCode: getRandomString(config.event.invitationCodeLength),
  //     expiredAt,
  //     createdAt: now
  //   };
  //   return await UserInvitationsRepo.addNew(invitationToAdd);
  // }

  // /**
  //  * Get invitor info if any, through an invitation code.
  //  * 1. if no invitiation code provided, return empty
  //  * 2. if provided invitation code does not found or expired, return empty
  //  * 3. if the invitee which the invitation code points to is not same as the logged in user, return empty
  //  *
  //  * @param  {any}             invitee        [description]
  //  * @param  {any}             event          [description]
  //  * @param  {string}          invitationCode [description]
  //  * @return {Promise<object>}                [description]
  //  */
  // async getEventInvitor(invitee: any, event: any, invitationCode: string): Promise<any> {
  //   if (!invitationCode) {
  //     return undefined;
  //   }
  //   const userInvitation = await UserInvitationsRepo.findByCode(invitationCode);
  //   if (!userInvitation) {
  //     logger.warn(`Invitation code ${invitationCode}, does not exist or expired`);
  //     return undefined;
  //   }
  //   const { mobile: inviteeMobile1 } = invitee;
  //   const { id: eventId } = event;
  //   const { type, objectId, invitor: invitorUserId, inviteeMobile } = userInvitation;
  //   if (inviteeMobile1 !== inviteeMobile) {
  //     logger.warn(`Mobile number ${inviteeMobile1} does not match the one ${inviteeMobile} in user invitation.`);
  //     return undefined;
  //   }
  //   return await UsersRepo.findById(invitorUserId);
  // }

  // async createCommissionCoupons(eventCommissions, options): Promise<any> {
  //   const coupons = [];
  //   const {
  //     event: { _id: eventId },
  //     commissions: { invitors, participators }
  //   } = eventCommissions;
  //   const event = await EventsRepo.findById(eventId);
  //   // console.log(event);
  //   // const refundRemainingAmount = this.getRemainingCommission(hostUserId, commissionAmount, event, participators);
  //   // const hostRefund = await this.createCommisionRefund(hostUserId, event, '退款 - 发车人返现', commissionAmount, refundRemainingAmount, options);
  //   // coupons.push(hostRefund);
  //   for (let i = 0; i < invitors.length; i++) {
  //     const {
  //       eventUser: eventUserId,
  //       user: { _id: userId },
  //       amount
  //     } = invitors[i];
  //     const invitorCoupon = await this.createUserCoupon(userId, eventUserId, '兑换券 - 邀请人', amount, options);
  //     coupons.push(invitorCoupon);
  //   }
  //   for (let i = 0; i < participators.length; i++) {
  //     const {
  //       eventUser: eventUserId,
  //       user: { _id: userId },
  //       amount
  //     } = participators[i];
  //     const participatorCoupon = await this.createUserCoupon(userId, eventUserId, '兑换券 - 参团人', amount, options);
  //     coupons.push(participatorCoupon);
  //   }
  //   return coupons;
  // }

  // async createUserCoupon(userId: string, objectId: string, description: string, amount: number, options = {}): Promise<any> {
  //   const now = nowDate();
  //   const expiredAt = addDays2(now, config.event.coupon.duration);
  //   const userCouponToAdd = {
  //     owner: userId,
  //     type: 'commission_refund',
  //     objectId,
  //     description,
  //     status: 'created',
  //     amount,
  //     expiredAt,
  //     createdAt: now
  //   };
  //   return await UserCouponsRepo.saveOrUpdate(userCouponToAdd, options);
  // }
}

export default new EventService();
