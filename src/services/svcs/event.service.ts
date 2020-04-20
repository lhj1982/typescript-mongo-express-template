import config from '../../config';
const axios = require('axios');
import logger from '../../middleware/logger.middleware';

import { IOrderModel } from '../../data/repositories/order/order.model';
import { IScriptModel } from '../../data/repositories/script/script.model';
import { IShopModel } from '../../data/repositories/shop/shop.model';
import { IUserModel } from '../../data/repositories/user/user.model';
import { IUserInvitationModel } from '../../data/repositories/user/userInvitation.model';
import { IDiscountRuleModel } from '../../data/repositories/discount-rule/discountRule.model';
import { IEventModel } from '../../data/repositories/event/event.model';
import { IEventCommissionModel } from '../../data/repositories/event/eventCommission.model';
import { IEventUserModel } from '../../data/repositories/event/eventUser.model';
import { IPriceWeeklySchemaModel } from '../../data/repositories/price/priceWeeklySchema.model';
import { IAddEventRequest } from '../requests/addEvent.request';

import GenericService from './generic.service';
import FileService from './file.service';
import OrderService from './order.service';
import UserService from './user.service';
import MessageService from './message.service';
import CacheService from './cache.service';
import { nowDate, addDays2, string2Date, date2String, formatDate, addDays, add, getDate } from '../../utils/dateUtil';
import { isEmpty, pp, getRandomString } from '../../utils/stringUtil';
import { getUserIds } from '../../utils/user';
import EventsRepo from '../../data/repositories/event/events.repository';
import DiscountRulesMapRepo from '../../data/repositories/discount-rule/discountRulesMap.repository';
import OrdersRepo from '../../data/repositories/order/orders.repository';
import RefundsRepo from '../../data/repositories/refund/refunds.repository';
import EventUsersRepo from '../../data/repositories/event/eventUsers.repository';
import UsersRepo from '../../data/repositories/user/users.repository';
import UserCouponsRepo from '../../data/repositories/coupon/userCoupons.repository';
import UserInvitationsRepo from '../../data/repositories/user/userInvitations.repository';
import {
  ResourceNotFoundException,
  EventCannotCreateException,
  EventCannotUpdateException,
  EventIsFullBookedException,
  EventCannotCompleteException,
  UserIsBlacklistedException
} from '../../exceptions/custom.exceptions';

class EventService extends GenericService {
  async findById(id: string, filter = { status: ['ready', 'completed', 'expired'] }): Promise<IEventModel> {
    const event = await EventsRepo.findById(id, filter);
    if (!event) {
      throw new ResourceNotFoundException('Event', id);
    }
    const { script } = event;
    if (!script) {
      logger.warn(`No online script is found for event: ${id}`);
      return undefined;
    }
    return event;
  }

  async findDetailById(eventId: string): Promise<IEventModel> {
    let event = await EventsRepo.findById(eventId);
    if (!event) {
      throw new ResourceNotFoundException('Event', eventId);
    }
    // get participators for given event
    const eventUsers = await EventUsersRepo.findByEvent(event);
    await this.updateEventParticpantsNumber(event, eventUsers);
    event = await EventsRepo.findById(eventId);
    const { script, shop } = event;
    const priceWeeklySchema = await EventsRepo.findPriceWeeklySchemaByEvent(script, shop);
    return Object.assign(event, { priceWeeklySchema });
  }

  async findByIdSimplified(eventId: string): Promise<IEventModel> {
    let event = await EventsRepo.findByIdSimplified(eventId);
    if (!event) {
      throw new ResourceNotFoundException('Event', eventId);
    }
    // get participators for given event
    const eventUsers = await EventUsersRepo.findByEvent(event);
    await this.updateEventParticpantsNumber(event, eventUsers);
    event = await EventsRepo.findByIdSimplified(eventId);
    return event;
  }

  async findEventUserById(eventUserId: string): Promise<IEventUserModel> {
    return await EventUsersRepo.findById(eventUserId);
  }

  async addEvent(script: IScriptModel, shop: IShopModel, hostUser: IUserModel, loggedInUser: IUserModel, data: IAddEventRequest): Promise<any> {
    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };
      const { shopId, scriptId, startTime, hostUserId, hostComment, numberOfPlayers, price, hostUserMobile, hostUserWechatId } = data;
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
        mobile: isEmpty(hostUserMobile) ? hostUserMobile : loggedInUser.mobile,
        wechatId: isEmpty(hostUserWechatId) ? hostUserWechatId : loggedInUser.mobile
      });
      await UsersRepo.saveOrUpdateUser(userToUpdate, opts);

      const applicableDiscountRules = await this.generateAvailableDiscountRules(script, shop, startTime);
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
        if (supportPayment) {
          const order = {
            createdBy: hostUserId,
            type: 'event_join',
            amount: (price * 100).toFixed(),
            objectId: newEventUser.id,
            outTradeNo: getRandomString(32),
            orderStatus: 'created'
          };
          // console.log(order);
          newOrder = await OrderService.createOrder(order, opts);
        }
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
   * Generate event commissions.
   * 1. Check if user is a member or not
   * 2. Calculate commissions accordingly
   *
   * @type {[type]}
   */
  generateEventCommission = async (event: IEventModel, eventUsers: IEventUserModel[]): Promise<any> => {
    const { discountRule, price } = event;
    // const totalAmount = price * eventUsers.length;
    // console.log(discountRule);
    if (discountRule) {
      const { discount } = discountRule;
      const { invitor: invitorRate, participator: participatorRate } = discount;
      // console.log(discount);
      // const hostCommission = {
      //   user: hostUser,
      //   amount: (totalAmount * host) / 100
      // };
      const participatorCommissions = eventUsers.map(async eventUser => {
        const { _id, user } = eventUser;
        const member = await UserService.getUserMember(user);
        let amount = ((price * participatorRate) / 100).toFixed();
        if (!member) {
          // if not a member, half the commission
          logger.debug(`participator user ${user.id} is not a member yet, half the commission`);
          amount = ((price * participatorRate) / 100 / 2).toFixed();
        }
        return {
          eventUser: _id,
          user,
          amount
        };
      });
      const invitorCommissions = eventUsers
        .map(async eventUser => {
          const { _id, invitor } = eventUser;
          if (invitor) {
            const member = await UserService.getUserMember(invitor);
            let amount = ((price * invitorRate) / 100).toFixed();
            if (!member) {
              // if not a member, half the commission
              logger.debug(`invitor user ${invitor.id} is not a member yet, half the commission`);
              amount = ((price * invitorRate) / 100 / 2).toFixed();
            }
            return {
              eventUser: _id,
              user: invitor,
              amount
            };
          } else {
            return undefined;
          }
        })
        .filter(_ => _);
      const commissions = {
        participators: participatorCommissions,
        invitors: invitorCommissions
      };
      return {
        event,
        commissions
      };
    } else {
      return undefined;
    }
  };

  /**
   * Update event participants stats.
   *
   * @param {[type]} event      [description]
   * @param {[type]} eventUsers [description]
   */
  updateEventParticpantsNumber = async (event: IEventModel, eventUsers: IEventUserModel[]): Promise<IEventModel> => {
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

  async getQrCode(appName: string, eventId: string): Promise<any> {
    const time2 = 0;
    const time1 = new Date().getTime();
    if (!time2 && time1 - time2 > 7000) {
      try {
        const response = await axios.get(
          `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config['appName'][appName]['appId']}&secret=${config['appName'][appName]['appSecret']}`
        );
        const {
          data: { access_token: accessToken }
        } = response;
        const imageData = await this.getwxcode(accessToken, eventId);

        const base64Str = Buffer.from(imageData, 'binary').toString('base64');
        const uploadResp = await FileService.uploadFileBase64(`static/images/events/qrcode/${eventId}.png`, base64Str);
        return uploadResp;
      } catch (err) {
        if (err.error == 'file exists') {
          const uploadResp = {
            hash: '',
            key: `static/images/events/qrcode/${eventId}.png`
          };
          return uploadResp;
        }
        logger.error(err);
        throw err;
      }
    }
  }

  async getwxcode(accessToken: string, eventId: string): Promise<any> {
    //方法2： 利用request模块发起请求
    const postData = {
      page: 'pages/event_detail', //二维码默认打开小程序页面
      scene: eventId,
      width: 100,
      auto_color: false
    };
    // postData = JSON.stringify(postData);
    const response = await axios({
      responseType: 'arraybuffer',
      method: 'POST',
      url: `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
      headers: {
        'Content-Type': 'image/png'
      },
      data: pp(postData)
    });
    const { data } = response;
    return data;
  }

  /**
   * Rules for cancel bookings, for both cancelled event and event which its price has updated
   *
   * 1. find all paid eventUsers for given event
   * 2. Mark them as unpaid + statusNote
   * 3. Mark all paid orders for those bookings to refund_requested
   *
   * @param {[type]} event   [description]
   * @param {{}}   options [description]
   */
  async cancelBookings(event, statusNote: string, refundDesc: string, immediateRefund = false, options: {}): Promise<any[]> {
    const { id } = event;
    const eventUsers = await EventUsersRepo.findByEvent(id, {
      status: ['paid']
    });
    // console.log(eventUsers);
    // find all paid orders and mark them as refund
    const refundedOrders = [];
    for (let i = 0; i < eventUsers.length; i++) {
      const eventUser = eventUsers[i];
      try {
        const order = await this.cancelBooking(eventUser, refundDesc, immediateRefund, options);
        await this.markEventUsersUnpaid(eventUser, statusNote, options);
        if (order) {
          refundedOrders.push(order);
        }
      } catch (err) {
        logger.error(err);
      }
    }
    logger.info(`Found orders to be refunded, ${pp(refundedOrders)}`);
    return refundedOrders;
  }

  async cancelBooking(eventUser: any, refundDesc: string, immediateRefund = false, options: any): Promise<IOrderModel> {
    const {
      user: { id: createdBy },
      id: objectId
    } = eventUser;
    const params = {
      createdBy,
      type: 'event_join',
      objectId,
      orderStatus: 'paid'
    };
    // console.log(params);
    // console.log(params);
    const order = await OrdersRepo.findByParams(params);
    // console.log(orders);
    if (order) {
      const { amount, outTradeNo, _id } = order;
      // console.log('ssss');
      await OrdersRepo.updateStatus(params, { orderStatus: 'refund' }, options);
      await RefundsRepo.saveOrUpdate(
        {
          order: _id,
          user: createdBy,
          totalAmount: amount,
          refundAmount: amount,
          outTradeNo,
          outRefundNo: getRandomString(32),
          refundDesc,
          type: 'refund',
          status: immediateRefund ? 'approved' : 'created',
          createdAt: nowDate()
        },
        options
      );
      return order;
    } else {
      logger.warn(`No paid order is found, ${pp(params)}, no need to process`);
      return undefined;
    }
  }

  async markEventUsersUnpaid(eventUser, statusNote, options): Promise<IEventUserModel> {
    const eventUserToUpdate = Object.assign(eventUser.toObject(), {
      status: 'unpaid',
      statusNote
    });
    return await EventUsersRepo.update(eventUserToUpdate, options);
  }

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

  getAvailableDiscountRulesFromDB = async (script: IScriptModel, shop: IShopModel, startTime: string = undefined): Promise<any> => {
    let result = await DiscountRulesMapRepo.findByShopAndScript(shop, script, startTime);
    if (result.length === 0) {
      result = await DiscountRulesMapRepo.findByShopAndScript(shop, undefined, startTime);
    }
    return result;
  };

  async generateAvailableDiscountRules(script: IScriptModel, shop: IShopModel, startTime?: string): Promise<any> {
    const { id: shopId } = shop;
    const { id: scriptId } = script;
    const availableDiscountRulesRaw = await this.getAvailableDiscountRulesFromDB(script, shop, startTime);
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
  }

  isPaymentSupported(shop: IShopModel): boolean {
    const { supportedPaymentMethods } = shop;
    if (supportedPaymentMethods && supportedPaymentMethods.length > 0 && supportedPaymentMethods.indexOf('wechat') != -1) {
      return true;
    }
    return false;
  }

  async archiveEvents(): Promise<any> {
    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };
      const result = await EventsRepo.archiveEvents(opts);
      const { eventIds } = result;
      const promises = eventIds.map(async eventId => {
        const event = await EventsRepo.findById(eventId);
        const { supportPayment } = event;
        let response = undefined;
        if (supportPayment) {
          logger.info(`Event is payment enabled, cancel all payments if exist for expired events`);
          response = await this.cancelBookings(event, 'event_cancelled', '退款 - 发团过期', true, opts);
        }
        return response;
      });
      await Promise.all(promises);
      await session.commitTransaction();
      await this.endSession();
      return result;
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }

  async inviteUser(invitor: IUserModel, event: IEventModel, inviteeMobile: string): Promise<IUserInvitationModel> {
    const { id: invitorUserId } = invitor;
    const { id: eventId } = event;
    const now = nowDate();
    const expiredAt = addDays2(now, config.event.invitationDuration);
    const invitationToAdd = {
      invitor: invitorUserId,
      objectId: eventId,
      type: 'event_user_invitation',
      inviteeMobile,
      invitationCode: getRandomString(config.event.invitationCodeLength),
      expiredAt,
      createdAt: now
    };
    return await UserInvitationsRepo.addNew(invitationToAdd);
  }

  /**
   * Get invitor info if any, through an invitation code.
   * 1. if no invitiation code provided, return empty
   * 2. if provided invitation code does not found or expired, return empty
   * 3. if the invitee which the invitation code points to is not same as the logged in user, return empty
   *
   * @param  {any}             invitee        [description]
   * @param  {any}             event          [description]
   * @param  {string}          invitationCode [description]
   * @return {Promise<object>}                [description]
   */
  async getEventInvitor(invitee: any, event: any, invitationCode: string): Promise<any> {
    if (!invitationCode) {
      return undefined;
    }
    const userInvitation = await UserInvitationsRepo.findByCode(invitationCode);
    if (!userInvitation) {
      logger.warn(`Invitation code ${invitationCode}, does not exist or expired`);
      return undefined;
    }
    const { mobile: inviteeMobile1 } = invitee;
    // const { id: eventId } = event;
    const {
      invitor: { id: invitorUserId },
      inviteeMobile
    } = userInvitation;
    if (inviteeMobile1 !== inviteeMobile) {
      logger.warn(`Mobile number ${inviteeMobile1} does not match the one ${inviteeMobile} in user invitation.`);
      return undefined;
    }
    return await UsersRepo.findById(invitorUserId);
  }

  async createCommissionCoupons(eventCommissions: IEventCommissionModel, options: any): Promise<any> {
    const coupons = [];
    const {
      commissions: { invitors, participators }
    } = eventCommissions;
    // const event = await EventsRepo.findById(eventId);
    // console.log(event);
    // const refundRemainingAmount = this.getRemainingCommission(hostUserId, commissionAmount, event, participators);
    // const hostRefund = await this.createCommisionRefund(hostUserId, event, '退款 - 发车人返现', commissionAmount, refundRemainingAmount, options);
    // coupons.push(hostRefund);
    for (let i = 0; i < invitors.length; i++) {
      const {
        eventUser: { id: eventUserId },
        user: { _id: userId },
        amount
      } = invitors[i];
      const invitorCoupon = await this.createUserCoupon(userId, eventUserId, '兑换券 - 邀请人', amount, options);
      coupons.push(invitorCoupon);
    }
    for (let i = 0; i < participators.length; i++) {
      const {
        eventUser: { id: eventUserId },
        user: { _id: userId },
        amount
      } = participators[i];
      const participatorCoupon = await this.createUserCoupon(userId, eventUserId, '兑换券 - 参团人', amount, options);
      coupons.push(participatorCoupon);
    }
    return coupons;
  }

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

  async findByDate(startDate: string, status: any): Promise<IEventModel[]> {
    const from = formatDate(startDate);
    const to = addDays(startDate, 1);
    console.log(`Find event between ${from} and ${to}...`);
    return await EventsRepo.findByDate(from, to, status);
  }

  async findEventsCountByDate(dateStr: string, status: any): Promise<any> {
    const date = string2Date(dateStr, false, 'YYYY-MM');
    const from = date
      .clone()
      .startOf('month')
      .utc();
    const to = date
      .clone()
      .endOf('month')
      .utc();
    // const dateArr = [date.clone().day(-1), date.clone().day(0), date.clone().day(1), date.clone().day(2), date.clone().day(3), date.clone().day(4), date.clone().day(5)];
    console.log(`Find event count from ${from} to ${to}...`);
    const result = await EventsRepo.findEventsCountByDates(from, to, status);
    return result;
  }

  async findPriceWeeklySchemaByEvent(script: IScriptModel, shop: IShopModel): Promise<IPriceWeeklySchemaModel> {
    return await EventsRepo.findPriceWeeklySchemaByEvent(script, shop);
  }

  async findDiscountRulesByShopAndScript(shop: IShopModel, script: IScriptModel): Promise<any> {
    return await EventsRepo.findDiscountRulesByShopAndScript(shop, script);
  }

  async find(
    params: {
      script?: IScriptModel;
      shop?: IShopModel;
      keyword?: string;
      offset?: number;
      limit?: number;
    },
    filter?: any,
    sort?: any
  ): Promise<any> {
    return await EventsRepo.find(params, filter, sort);
  }

  async updateEvent(event: IEventModel, data: any): Promise<IEventModel> {
    const { numberOfOfflinePlayers, hostComment, price, startTime } = data;
    const { id: eventId, script, shop, price: originalPrice } = event;
    // const script = await ScriptsRepo.findById(scriptId);

    const updateData = {};
    if (numberOfOfflinePlayers) {
      updateData['numberOfOfflinePlayers'] = numberOfOfflinePlayers;
    }
    if (hostComment) {
      updateData['hostComment'] = hostComment;
    }
    if (price) {
      updateData['price'] = price;
    }
    if (startTime) {
      updateData['startTime'] = formatDate(startTime, config.eventDateFormatParse);
      const { duration } = script;
      const endTime = add(startTime, duration, 'm');
      if (endTime) {
        updateData['endTime'] = endTime;
      }
      const applicableDiscountRules = await this.generateAvailableDiscountRules(script, shop, startTime);
      // console.log(applicableDiscountRules);
      let discountRule = undefined;
      if (applicableDiscountRules.length > 0) {
        if (applicableDiscountRules.length > 1) {
          throw new EventCannotUpdateException(eventId);
        }
        discountRule = applicableDiscountRules[0]._id;
      }
      updateData['discountRule'] = discountRule;
    }

    // console.log(event.discountRule);
    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };
      updateData['updatedAt'] = new Date();
      const eventToUpdate = Object.assign(event.toObject(), updateData);
      logger.info(`Update event ${pp(eventToUpdate)}`);
      // console.log(eventToUpdate.discountRule);
      const newEvent = await EventsRepo.saveOrUpdate(eventToUpdate, opts);
      // if price has changed, refund all paid players
      if (price && originalPrice != price) {
        logger.info(`Detecting price is changed, cancel all paid bookings, event: ${eventId}`);
        await this.cancelBookings(event, 'price_updated', '退款 - 价格改变', true, opts);
      }
      await session.commitTransaction();
      await this.endSession();
      // await CacheService.purgeEventCache(newEvent, req);
      return newEvent;
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }

  async joinEvent(loggedInUser: IUserModel, event: IEventModel, params: any): Promise<any> {
    const { id: eventId, price, supportPayment } = event;
    const { userName, source, userId, mobile, wechatId, invitationCode } = params;
    // get participators for given event
    let eventUsers = await EventUsersRepo.findByEvent(event, {
      status: ['paid', 'unpaid']
    });
    await this.updateEventParticpantsNumber(event, eventUsers);
    const existingEventUser = eventUsers.find(_ => {
      const {
        user: { _id: eventUserId }
      } = _;
      return userId === eventUserId.toString();
    });
    // console.log(existingEventUser);
    // if there is an entry already, return existing booking
    if (existingEventUser) {
      logger.info(`Found existing booking for user ${userId}, event ${eventId}`);

      let newOrder;
      if (supportPayment) {
        const order = {
          createdBy: userId,
          type: 'event_join',
          objectId: existingEventUser.id,
          amount: (price * 100).toFixed(),
          outTradeNo: getRandomString(32),
          status: 'created'
        };
        newOrder = await OrderService.createOrder(order, {});
      }
      if (newOrder) {
        return Object.assign(existingEventUser.toObject(), {
          order: newOrder.toObject()
        });
      } else {
        return existingEventUser.toObject();
      }
    }
    if (!this.canJoinEvent(event, eventUsers)) {
      throw new EventIsFullBookedException(eventId);
    }
    eventUsers = await EventUsersRepo.findByEvent(event, {
      status: ['paid', 'unpaid', 'blacklisted']
    });
    if (this.isBlacklistedUser(userId, eventUsers)) {
      throw new UserIsBlacklistedException(eventId, userId);
    }
    const invitor = await this.getEventInvitor(loggedInUser, event, invitationCode);
    if (invitor) {
      logger.info(`User ${userId} tries to join event ${eventId} with invitor ${invitor.id}`);
    }
    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };
      const newEventUser = await EventUsersRepo.saveOrUpdate(
        {
          event: eventId,
          user: userId,
          userName,
          source,
          mobile,
          wechatId,
          status: 'unpaid',
          createdAt: new Date(),
          invitor: invitor ? invitor.id : undefined,
          invitationCode
        },
        opts
      );
      // const user = await UsersRepo.findById(userId);
      // const userToUpdate = Object.assign(user, {
      //   wechatId
      // });
      // await UsersRepo.saveOrUpdateUser(userToUpdate);
      const event = await EventsRepo.findById(eventId);
      const newOrder = await OrderService.createOrder(
        {
          createdBy: userId,
          type: 'event_join',
          objectId: newEventUser.id,
          amount: (price * 100).toFixed(),
          outTradeNo: getRandomString(32),
          status: 'created'
        },
        opts
      );
      // save notifications in db and send sms if necessary
      await MessageService.saveNewJoinEventNotifications(event, newEventUser, opts);
      await session.commitTransaction();
      await this.endSession();
      // await CacheService.purgeEventCache(event, req);
      return Object.assign(newEventUser.toObject(), { order: newOrder });
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }

  canJoinEvent = (event: IEventModel, eventUsers: IEventUserModel[]): boolean => {
    const { numberOfOfflinePlayers, maxNumberOfSpots } = event;
    const numberOfOnlinePersons = eventUsers.length;
    return numberOfOnlinePersons + numberOfOfflinePlayers < maxNumberOfSpots;
  };

  isBlacklistedUser = (userId: string, eventUsers: IEventUserModel[]): boolean => {
    let blacklisted = false;
    for (let i = 0; i < eventUsers.length; i++) {
      const eventUser = eventUsers[i];
      const {
        status,
        user: { id: existingUserId }
      } = eventUser;
      // console.log(userId + ', ' + existingUserId + ', ' + status);
      if (status === 'blacklisted' && existingUserId === userId) {
        blacklisted = true;
        break;
      }
    }
    return blacklisted;
  };

  async cancelEventUser(event: IEventModel, userToCancel: IUserModel, params: any): Promise<IEventUserModel> {
    const { status } = params;
    const { supportPayment } = event;
    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };
      const eventUser = await EventUsersRepo.findEventUser(event, userToCancel);
      // console.log(eventUser);
      if (supportPayment) {
        await this.cancelBooking(eventUser, '退款 - 参团人取消', true, opts);
      }
      const eventUserToUpdate = Object.assign(eventUser, {
        status: status,
        statusNote: 'user_event_cancelled'
      });
      console.log(eventUserToUpdate);
      const newEventUser = await EventUsersRepo.saveOrUpdate(eventUserToUpdate, opts);
      await session.commitTransaction();
      await this.endSession();
      // await CacheService.purgeEventCache(event);
      return newEventUser;
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }

  async cancelEvent(event: IEventModel): Promise<IEventModel> {
    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };
      const status = 'cancelled';
      const eventToUpdate = Object.assign(event.toObject(), { status });
      const newEvent = await EventsRepo.saveOrUpdate(eventToUpdate, opts);
      const { supportPayment } = event;
      if (supportPayment) {
        logger.info(`Event is payment enabled, cancel all paid bookings if exists`);
        await this.cancelBookings(event, 'event_cancelled', '退款 - 参团人取消', true, opts);
      }
      await session.commitTransaction();
      await this.endSession();
      // await CacheService.purgeEventCache(newEvent, req);
      return newEvent;
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }

  async createUserCoupon(userId: string, objectId: string, description: string, amount: number, options = {}): Promise<any> {
    const now = nowDate();
    const expiredAt = addDays2(now, config.event.coupon.duration);
    const userCouponToAdd = {
      owner: userId,
      type: 'commission_refund',
      objectId,
      description,
      status: 'created',
      amount,
      expiredAt,
      createdAt: now
    };
    return await UserCouponsRepo.saveOrUpdate(userCouponToAdd, options);
  }

  /**
   * A completed event should
   * 1. Mark event as completed
   * 2. Generate event commissions
   * 3. Send notifications
   * 4. Clear cache
   *
   * @param  {IEventModel}          event  [description]
   * @param  {string}               status [description]
   * @return {Promise<IEventModel>}        [description]
   */
  async completeEvent(event: IEventModel, status: string): Promise<IEventModel> {
    const session = await this.getSession();
    session.startTransaction();
    try {
      const { id: eventId, supportPayment, script, shop, startTime, discountRule: originalDiscountRule } = event;
      // get participators for given event
      const eventUsers = await EventUsersRepo.findByEvent(eventId);
      let newEvent = await this.updateEventParticpantsNumber(event, eventUsers);
      if (!this.canCompleteEvent(event, eventUsers)) {
        throw new EventCannotCompleteException(eventId);
      }
      const startTimeStr = date2String(startTime);
      const applicableDiscountRules = await this.generateAvailableDiscountRules(script, shop, startTimeStr);
      // if more than one discount found or the found discountRule is not same as the one one in db, it's an error!
      let discountRule = undefined;
      if (applicableDiscountRules.length > 0) {
        if (applicableDiscountRules.length > 1) {
          logger.error(`More than one discountRules found`);
          throw new EventCannotCompleteException(eventId);
        }
        discountRule = applicableDiscountRules[0]._id;
      }
      if (!this.isSameDiscountRule(originalDiscountRule, discountRule)) {
        logger.error(`Different discount rule found`);
        throw new EventCannotCompleteException(eventId);
      }

      const opts = { session };
      const eventToUpdate = Object.assign(newEvent, { status });
      newEvent = await EventsRepo.saveOrUpdate(eventToUpdate, opts);
      newEvent = await EventsRepo.findById(eventId);
      const eventCommissions = await this.generateEventCommission(newEvent, eventUsers);
      // console.log(eventCommissions);
      if (eventCommissions) {
        await EventsRepo.saveEventCommissions(eventCommissions, opts);
        if (supportPayment) {
          logger.info(`Event is payment enabled, creating commission coupons if exists`);
          const refunds = await this.createCommissionCoupons(eventCommissions, opts);
          logger.info(`Created ${refunds.length} commission coupons`);
        }
      }
      // await UserService.saveUserRewardsWhenEventCompleted(newEvent, opts);
      await MessageService.saveCompleteEventNotifications(newEvent, eventCommissions, opts);
      await session.commitTransaction();
      await this.endSession();
      // await CacheService.purgeEventCache(newEvent, req);
      await CacheService.purgeUserCache(getUserIds(eventCommissions));
      return newEvent;
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }

  isSameDiscountRule(discountRule1: IDiscountRuleModel, discountRule2: IDiscountRuleModel): boolean {
    if (!discountRule1 && !discountRule2) {
      return true;
    }
    if ((!discountRule1 && discountRule2) || (discountRule1 && !discountRule2)) {
      return false;
    }
    const { _id: ruleId1 } = discountRule1;
    const { _id: ruleId2 } = discountRule2;
    return ruleId1.toString() === ruleId2.toString();
  }

  canCompleteEvent = (event: IEventModel, eventUsers: IEventUserModel[]): boolean => {
    let allPaid = true;
    for (let i = 0; i < eventUsers.length; i++) {
      const eventUser = eventUsers[i];
      const { status } = eventUser;
      if (status === 'unpaid') {
        allPaid = false;
        break;
      }
    }
    // console.log(allPaid);
    const { numberOfOfflinePlayers, minNumberOfSpots, maxNumberOfSpots } = event;
    const numberOfOnlinePersons = eventUsers.length;
    console.log(allPaid + ', ' + numberOfOnlinePersons + ', ' + numberOfOfflinePlayers + ', ' + minNumberOfSpots + ', ' + maxNumberOfSpots);
    return allPaid && numberOfOnlinePersons + numberOfOfflinePlayers >= minNumberOfSpots && numberOfOnlinePersons + numberOfOfflinePlayers <= maxNumberOfSpots;
  };

  async findEventsByUser(user: IUserModel, status: string[]): Promise<IEventModel[]> {
    return await EventsRepo.findEventsByUser(user, {
      status
    });
  }

  async updateBookingPaymentStatus(eventUserId: string, options: any = {}): Promise<IEventUserModel> {
    const eventUser = await EventUsersRepo.findById(eventUserId);
    const eventUserToUpdate = Object.assign(eventUser.toObject(), {
      status: 'paid'
    });
    // console.log(eventUserToUpdate);
    return await EventUsersRepo.saveOrUpdate(eventUserToUpdate, options);
  }
}

export default new EventService();
