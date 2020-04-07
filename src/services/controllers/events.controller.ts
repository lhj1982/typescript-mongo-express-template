import { Route, Get, Controller, Post, BodyProp, Put, Delete, SuccessResponse, Tags, Body, OperationId, Request, Response, Security } from 'tsoa';
import { IAddEventRequest } from '../requests';
import { IResponse, IErrorResponse, IUserResponse } from '../responses';
import config from '../../config';
import logger from '../../middleware/logger';

import AuthApi from '../api/auth';
import {
  InvalidRequestException,
  ResourceAlreadyExist,
  ResourceNotFoundException,
  AccessDeniedException,
  EventCannotCreateException,
  EventCannotUpdateException,
  EventIsFullBookedException,
  EventCannotCompleteException,
  EventCannotCancelException,
  EventCannotInviteException,
  UserIsBlacklistedException
} from '../../exceptions/custom.exceptions';
import EventService from '../svcs/event.service';
// import { BaseController } from '../base.controller';
// import MessageService from '../services/message.service';
// import EventService from '../services/event.service';
// import OrderService from '../services/order.service';
// import CacheService from '../services/cache.service';
import ScriptService from '../svcs/script.service';
import ShopService from '../svcs/shop.service';
import UserService from '../svcs/user.service';

import { getRandomString, pp } from '../../utils/stringUtil';
import { getTopRole, getUserIds } from '../../utils/user';

@Route('/events')
export class EventsController {
  // getEvents = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     let offset = parseInt(req.query.offset);
  //     let limit = parseInt(req.query.limit);
  //     const { keyword, filter: filterStr, sort: sortStr } = req.query;
  //     let filterToUpdate = { status: ['ready'], availableSpots: -1 };
  //     let sortToUpdate = {};
  //     if (filterStr) {
  //       const filter = JSON.parse(decodeURIComponent(filterStr));
  //       filterToUpdate = Object.assign(filterToUpdate, filter);
  //       // console.log(filterToUpdate);
  //     }
  //     if (sortStr) {
  //       const sort = JSON.parse(decodeURIComponent(sortStr));
  //       sortToUpdate = Object.assign(sortToUpdate, sort);
  //     }
  //     if (!offset) {
  //       offset = config.query.offset;
  //     }
  //     if (!limit) {
  //       limit = config.query.limit;
  //     }
  //     // console.log(filterToUpdate);
  //     let result = await EventsRepo.find({ keyword, offset, limit }, filterToUpdate, sortToUpdate);
  //     const links = this.generateLinks(result.pagination, req.route.path, '');
  //     result = Object.assign({}, result, links);
  //     res.json(result);
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // getEventsByScriptAndShop = async (req: Request, res: Response) => {
  //   try {
  //     let offset = parseInt(req.query.offset);
  //     let limit = parseInt(req.query.limit);
  //     const { scriptId, shopId } = req.params;
  //     if (!offset) {
  //       offset = config.query.offset;
  //     }
  //     if (!limit) {
  //       limit = config.query.limit;
  //     }
  //     let result = await EventsRepo.find({ scriptId, shopId, offset, limit });
  //     const links = this.generateLinks(result.pagination, req.route.path, '');
  //     result = Object.assign({}, result, links);
  //     res.json(result);
  //   } catch (err) {
  //     res.send(err);
  //   }
  // };

  // getEventsByDate = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const offset = 0;
  //     const limit = 100;
  //     const { date } = req.params;
  //     const { status } = req.query;
  //     // default status filter
  //     let statusArr = ['ready', 'completed', 'expired'];
  //     if (status) {
  //       statusArr = status.split(',');
  //     }
  //     const from = formatDate(date);
  //     const to = addDays(date, 1);
  //     console.log(`Find event between ${from} and ${to}...`);
  //     const result = await EventsRepo.findByDate(from, to, {
  //       status: statusArr
  //     });
  //     res.json({ code: 'SUCCESS', data: result });
  //   } catch (err) {
  //     console.error(err);
  //     res.send(err);
  //   }
  // };

  // /**
  //  * Get number of events by given date in which the whole month it falls. date format: YYYY-MM
  //  *
  //  * @param {Request}      req  [description]
  //  * @param {Response}     res  [description]
  //  * @param {NextFunction} next [description]
  //  */
  // getEventsCountByDate = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { date: dateStr } = req.params;
  //     const { status } = req.query;
  //     let statusArr = ['ready', 'completed', 'expired'];
  //     if (status) {
  //       statusArr = status.split(',');
  //     }
  //     const date = string2Date(dateStr, false, 'YYYY-MM');
  //     const from = date
  //       .clone()
  //       .startOf('month')
  //       .utc();
  //     const to = date
  //       .clone()
  //       .endOf('month')
  //       .utc();
  //     // const dateArr = [date.clone().day(-1), date.clone().day(0), date.clone().day(1), date.clone().day(2), date.clone().day(3), date.clone().day(4), date.clone().day(5)];
  //     console.log(`Find event count from ${from} to ${to}...`);
  //     const result = await EventsRepo.findEventsCountByDates(from, to, {
  //       status: statusArr
  //     });
  //     res.json({ code: 'SUCCESS', data: result });
  //   } catch (err) {
  //     console.error(err);
  //     res.send(err);
  //   }
  // };

  @Post('/')
  @Tags('event')
  @OperationId('addEvent')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async addEvent(@Body() body: IAddEventRequest, @Request() req: any): Promise<IResponse> {
    try {
      const { shopId, scriptId, startTime, endTime, hostUserId, hostComment, numberOfPlayers, price, hostUserMobile, hostUserWechatId } = body;
      const { numberOfOfflinePlayers, isHostJoin, supportPayment } = body;
      if (!scriptId) {
        throw new InvalidRequestException('AddEvent', ['scriptId']);
      }
      if (!shopId) {
        throw new InvalidRequestException('AddEvent', ['shopId']);
      }
      if (!hostUserId) {
        throw new InvalidRequestException('AddEvent', ['hostUserId']);
      }
      if (!hostUserMobile) {
        throw new InvalidRequestException('AddEvent', ['hostUserMobile']);
      }
      if (!hostUserWechatId) {
        throw new InvalidRequestException('AddEvent', ['hostUserWechatId']);
      }
      if (!startTime) {
        throw new InvalidRequestException('AddEvent', ['startTime']);
      }
      // if (!numberOfPersons) {
      //   next(new InvalidRequestException('AddEvent', ['numberOfPersons']));
      //   return;
      // }

      const script = await ScriptService.findById(scriptId);
      if (!script) {
        throw new ResourceNotFoundException('Script', scriptId);
      }
      const shop = await ShopService.findById(shopId);
      if (!shop) {
        throw new ResourceNotFoundException('Shop', shopId);
      }
      const hostUser = await UserService.findById(hostUserId);
      if (!hostUser) {
        throw new ResourceNotFoundException('User', hostUserId);
      }
      const { minNumberOfSpots, maxNumberOfSpots } = script;
      if (!minNumberOfSpots || !maxNumberOfSpots) {
        throw new InvalidRequestException('AddEvent', ['minNumberOfSpots', 'maxNumberOfSpots']);
      }
      const { user: loggedInUser } = req;
      const newEvent = await EventService.addEvent(script, shop, hostUser, loggedInUser, body);
      return newEvent;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // /**
  //  * Update event status, numberOfOfflinePlayers
  //  *
  //  * @param {Request}      req  [description]
  //  * @param {Response}     res  [description]
  //  * @param {NextFunction} next [description]
  //  */
  // updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  //   const { numberOfOfflinePlayers, hostComment, price, startTime } = req.body;
  //   const { loggedInUser } = res.locals;
  //   const { eventId } = req.params;
  //   const event = await EventService.findById(eventId);
  //   if (!event) {
  //     next(new ResourceNotFoundException('Event', eventId));
  //     return;
  //   }
  //   const {
  //     script: { id: scriptId },
  //     shop: { id: shopId },
  //     price: originalPrice
  //   } = event;
  //   const script = await ScriptsRepo.findById(scriptId);

  //   const updateData = {};
  //   if (numberOfOfflinePlayers) {
  //     updateData['numberOfOfflinePlayers'] = numberOfOfflinePlayers;
  //   }
  //   if (hostComment) {
  //     updateData['hostComment'] = hostComment;
  //   }
  //   if (price) {
  //     updateData['price'] = price;
  //   }
  //   if (startTime) {
  //     updateData['startTime'] = formatDate(startTime, config.eventDateFormatParse);
  //     const { duration } = script;
  //     const endTime = add(startTime, duration, 'm');
  //     if (endTime) {
  //       updateData['endTime'] = endTime;
  //     }
  //     const applicableDiscountRules = await this.generateAvailableDiscountRules(scriptId, shopId, startTime);
  //     // console.log(applicableDiscountRules);
  //     let discountRule = undefined;
  //     if (applicableDiscountRules.length > 0) {
  //       if (applicableDiscountRules.length > 1) {
  //         next(new EventCannotUpdateException(eventId));
  //         return;
  //       }
  //       discountRule = applicableDiscountRules[0]._id;
  //     }
  //     updateData['discountRule'] = discountRule;
  //   }

  //   // console.log(event.discountRule);
  //   const session = await EventsRepo.getSession();
  //   session.startTransaction();
  //   try {
  //     const opts = { session };
  //     updateData['updatedAt'] = new Date();
  //     const eventToUpdate = Object.assign(event.toObject(), updateData);
  //     logger.info(`Update event ${pp(eventToUpdate)}`);
  //     // console.log(eventToUpdate.discountRule);
  //     const newEvent = await EventsRepo.saveOrUpdate(eventToUpdate, opts);
  //     // if price has changed, refund all paid players
  //     if (price && originalPrice != price) {
  //       logger.info(`Detecting price is changed, cancel all paid bookings, event: ${eventId}`);
  //       await EventService.cancelBookings(event, 'price_updated', '退款 - 价格改变', true, opts);
  //     }
  //     await session.commitTransaction();
  //     await EventsRepo.endSession();
  //     await CacheService.purgeEventCache(newEvent, req);
  //     res.json({ code: 'SUCCESS', data: newEvent });
  //   } catch (err) {
  //     await session.abortTransaction();
  //     await EventsRepo.endSession();
  //     next(err);
  //   }
  // };

  // /**
  //  * User choose to join the event.
  //  *
  //  * @param {Request}      req  [description]
  //  * @param {Response}     res  [description]
  //  * @param {NextFunction} next [description]
  //  */
  // joinUserEvent = async (req: Request, res: Response, next: NextFunction) => {
  //   const { eventId } = req.params;
  //   const { userName, source, userId, mobile, wechatId, invitationCode } = req.body;
  //   const { loggedInUser } = res.locals;
  //   const event = await EventService.findById(eventId);
  //   if (!event) {
  //     next(new ResourceNotFoundException('Event', eventId));
  //     return;
  //   }
  //   if (userId && userName) {
  //     next(new InvalidRequestException('JoinEvent', ['userId', 'userName']));
  //     return;
  //   }
  //   if (source != 'online' && source != 'offline') {
  //     next(new InvalidRequestException('JoinEvent', ['source']));
  //     return;
  //   }
  //   if (source === 'online' && !userId) {
  //     next(new InvalidRequestException('JoinEvent', ['source', 'userId']));
  //     return;
  //   }
  //   if (source === 'offline' && !userName) {
  //     next(new InvalidRequestException('JoinEvent', ['source', 'userName']));
  //     return;
  //   }
  //   if (!wechatId) {
  //     next(new InvalidRequestException('JoinEvent', ['wechatId']));
  //     return;
  //   }
  //   if (userId != loggedInUser.id) {
  //     next(new AccessDeniedException(userId, 'You are only join event yourself'));
  //     return;
  //   }
  //   // if (userId) {
  //   //   const user = await UsersRepo.findById(userId);
  //   //   if (!user) {
  //   //     next(new ResourceNotFoundException('User', userId));
  //   //     return;
  //   //   }
  //   // }

  //   // get participators for given event
  //   let eventUsers = await EventUsersRepo.findByEvent(eventId, {
  //     status: ['paid', 'unpaid']
  //   });
  //   await this.updateEventParticpantsNumber(event, eventUsers);
  //   const existingEventUser = eventUsers.find(_ => {
  //     const {
  //       user: { _id: eventUserId }
  //     } = _;
  //     return userId === eventUserId.toString();
  //   });
  //   // console.log(existingEventUser);
  //   // if there is an entry already, return existing booking
  //   if (existingEventUser) {
  //     logger.info(`Found existing booking for user ${userId}, event ${eventId}`);
  //     // const { _id } = existingEventUser;
  //     // let order = await OrderService.findByObjectId(_id, 'created');
  //     const order = await this.createOrder(userId, event, existingEventUser, {});

  //     // console.log(order);
  //     // console.log(Object.assign(existingEventUser, { order: order }));
  //     res.json({
  //       code: 'SUCCESS',
  //       data: Object.assign(existingEventUser.toObject(), {
  //         order: order.toObject()
  //       })
  //     });
  //     return;
  //   }
  //   if (!this.canJoinEvent(event, eventUsers)) {
  //     next(new EventIsFullBookedException(eventId));
  //     return;
  //   }
  //   eventUsers = await EventUsersRepo.findByEvent(eventId, {
  //     status: ['paid', 'unpaid', 'blacklisted']
  //   });
  //   if (this.isBlacklistedUser(userId, eventUsers)) {
  //     next(new UserIsBlacklistedException(eventId, userId));
  //     return;
  //   }
  //   const invitor = await EventService.getEventInvitor(loggedInUser, event, invitationCode);
  //   if (invitor) {
  //     logger.info(`User ${userId} tries to join event ${eventId} with invitor ${invitor.id}`);
  //   }
  //   const session = await EventsRepo.getSession();
  //   session.startTransaction();
  //   try {
  //     const opts = { session };
  //     const newEventUser = await EventUsersRepo.saveOrUpdate(
  //       {
  //         event: eventId,
  //         user: userId,
  //         userName,
  //         source,
  //         mobile,
  //         wechatId,
  //         status: 'unpaid',
  //         createdAt: new Date(),
  //         invitor: invitor ? invitor.id : undefined,
  //         invitationCode
  //       },
  //       opts
  //     );
  //     const user = await UsersRepo.findById(userId);
  //     const userToUpdate = Object.assign(user, {
  //       wechatId
  //     });
  //     await UsersRepo.saveOrUpdateUser(user);
  //     const event = await EventService.findById(eventId);
  //     const newOrder = await this.createOrder(userId, event, newEventUser, opts);
  //     // save notifications in db and send sms if necessary
  //     await MessageService.saveNewJoinEventNotifications(event, newEventUser, opts);
  //     await session.commitTransaction();
  //     await EventsRepo.endSession();
  //     await CacheService.purgeEventCache(event, req);
  //     res.json({
  //       code: 'SUCCESS',
  //       data: Object.assign(newEventUser.toObject(), { order: newOrder })
  //     });
  //   } catch (err) {
  //     await session.abortTransaction();
  //     await EventsRepo.endSession();
  //     next(err);
  //   }
  // };

  // createOrder = async (userId, event, eventUser, opts) => {
  //   const { price, supportPayment } = event;
  //   let newOrder;
  //   if (supportPayment) {
  //     const order = {
  //       createdBy: userId,
  //       type: 'event_join',
  //       objectId: eventUser.id,
  //       amount: (price * 100).toFixed(),
  //       outTradeNo: getRandomString(32),
  //       status: 'created'
  //     };
  //     newOrder = await OrderService.createOrder(order, opts);
  //   }
  //   return newOrder;
  // };

  // getEventDetails = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { eventId } = req.params;
  //     let event = await EventService.findById(eventId);
  //     if (!event) {
  //       next(new ResourceNotFoundException('Event', eventId));
  //       return;
  //     }
  //     // get participators for given event
  //     const eventUsers = await EventUsersRepo.findByEvent(eventId);
  //     await this.updateEventParticpantsNumber(event, eventUsers);
  //     event = await EventService.findById(eventId);
  //     if (!event) {
  //       next(new ResourceNotFoundException('Event', eventId));
  //       return;
  //     }
  //     const { _id: scriptId } = event.script;
  //     const { _id: shopId } = event.shop;
  //     const priceWeeklySchema = await EventsRepo.findPriceWeeklySchemaByEvent(scriptId, shopId);
  //     const resp = Object.assign(event, { priceWeeklySchema });
  //     res.json({
  //       code: 'SUCCESS',
  //       data: resp
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // getEventDetailsSimplified = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { eventId } = req.params;
  //     let event = await EventsRepo.findByIdSimplified(eventId);
  //     if (!event) {
  //       next(new ResourceNotFoundException('Event', eventId));
  //       return;
  //     }
  //     // get participators for given event
  //     const eventUsers = await EventUsersRepo.findByEvent(eventId);
  //     await this.updateEventParticpantsNumber(event, eventUsers);
  //     event = await EventsRepo.findByIdSimplified(eventId);

  //     res.json({
  //       code: 'SUCCESS',
  //       data: event
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // getPriceWeeklySchema = async (req: Request, res: Response, next: NextFunction) => {
  //   const { scriptId, shopId } = req.query;
  //   const script = await ScriptsRepo.findById(scriptId);
  //   const shop = await ShopsRepo.findById(shopId);
  //   if (!shop) {
  //     next(new ResourceNotFoundException('Shop', shopId));
  //     return;
  //   }
  //   if (!script) {
  //     next(new ResourceNotFoundException('Script', scriptId));
  //     return;
  //   }
  //   const priceWeeklySchema = await EventsRepo.findPriceWeeklySchemaByEvent(scriptId, shopId);
  //   res.json({ code: 'SUCCESS', data: priceWeeklySchema });
  // };

  // getDiscountRules = async (req: Request, res: Response, next: NextFunction) => {
  //   const { scriptId, shopId } = req.query;
  //   const script = await ScriptsRepo.findById(scriptId);
  //   const shop = await ShopsRepo.findById(shopId);
  //   if (!shop) {
  //     next(new ResourceNotFoundException('Shop', shopId));
  //   }
  //   const discountRules = await EventsRepo.findDiscountRulesByShopAndScript(shopId, scriptId);
  //   res.json({ code: 'SUCCESS', data: discountRules });
  // };

  // /**
  //  * Used for update event users. for example, user cancel join event,
  //  *
  //  * @param {Request}      req  [description]
  //  * @param {Response}     res  [description]
  //  * @param {NextFunction} next [description]
  //  */
  // cancelEventUser = async (req: Request, res: Response, next: NextFunction) => {
  //   const { eventId } = req.params;
  //   const event = await EventService.findById(eventId);
  //   if (!event) {
  //     next(new ResourceNotFoundException('Event', eventId));
  //     return;
  //   }
  //   const {
  //     hostUser: { id: hostUserId },
  //     supportPayment
  //   } = event;
  //   const { loggedInUser } = res.locals;
  //   const { userId, status } = req.body;
  //   try {
  //     if (status != 'cancelled' && status != 'blacklisted') {
  //       next(new InvalidRequestException('EventUser', ['status']));
  //       return;
  //     }

  //     if (status === 'cancelled') {
  //       if (loggedInUser.id != hostUserId && loggedInUser.id != userId) {
  //         next(new AccessDeniedException(loggedInUser.id, 'You are not a host or you are trying to cancel others booking'));
  //         return;
  //       }
  //     }

  //     if (status === 'blacklisted' && hostUserId != loggedInUser.id) {
  //       next(new AccessDeniedException(loggedInUser.id, 'Only host can blacklist user'));
  //       return;
  //     }
  //   } catch (err) {
  //     next(err);
  //   }

  //   const session = await EventsRepo.getSession();
  //   session.startTransaction();
  //   try {
  //     const opts = { session };
  //     const eventUser = await EventUsersRepo.findEventUser(eventId, userId);
  //     // console.log(eventUser);
  //     if (supportPayment) {
  //       await EventService.cancelBooking(eventUser, '退款 - 参团人取消', true, opts);
  //     }
  //     const eventUserToUpdate = Object.assign(eventUser, {
  //       status: status,
  //       statusNote: 'user_event_cancelled'
  //     });
  //     console.log(eventUserToUpdate);
  //     const newEventUser = await EventUsersRepo.saveOrUpdate(eventUserToUpdate, opts);
  //     await session.commitTransaction();
  //     await EventsRepo.endSession();
  //     await CacheService.purgeEventCache(event, req);
  //     res.json({ code: 'SUCCESS', data: newEventUser });
  //   } catch (err) {
  //     await session.abortTransaction();
  //     await EventsRepo.endSession();
  //     next(err);
  //   }
  // };

  // /**
  //  * Orgnizer can mark event user paid or not.
  //  *
  //  * @param {Request}      req  [description]
  //  * @param {Response}     res  [description]
  //  * @param {NextFunction} next [description]
  //  */
  // updateEventUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  //   const { eventId } = req.params;
  //   const event = await EventService.findById(eventId);
  //   if (!event) {
  //     next(new ResourceNotFoundException('Event', eventId));
  //     return;
  //   }
  //   const { loggedInUser } = res.locals;
  //   const { userId, status } = req.body;
  //   if (['paid', 'unpaid'].indexOf(status) == -1) {
  //     next(new InvalidRequestException('EventUser', ['status']));
  //     return;
  //   }
  //   // if (userId != loggedInUser._id) {
  //   // 	next(new AccessDeniedException(''));
  //   // }
  //   const { hostUser } = event;
  //   const { id: hostUserId } = hostUser;
  //   const { id: loggedInUserId } = loggedInUser;
  //   if (loggedInUser.id != hostUser.id) {
  //     next(new AccessDeniedException(loggedInUser._id, 'Only host can update status'));
  //     return;
  //   }

  //   const eventUser = await EventUsersRepo.findEventUser(eventId, userId);

  //   const session = await EventsRepo.getSession();
  //   session.startTransaction();
  //   try {
  //     const opts = { session };
  //     const eventUserToUpdate = Object.assign(eventUser, { status: status });
  //     const newEventUser = await EventUsersRepo.saveOrUpdate(eventUserToUpdate, opts);

  //     await session.commitTransaction();
  //     await EventsRepo.endSession();
  //     res.json({ code: 'SUCCESS', data: newEventUser });
  //   } catch (err) {
  //     await session.abortTransaction();
  //     await EventsRepo.endSession();
  //     next(err);
  //   }
  // };

  // // updateEventUser = async (req: Request, res: Response, next: NextFunction) => {
  // //   const { eventId } = req.params;
  // //   const event = await EventService.findById(eventId);
  // //   if (!event) {
  // //     next(new ResourceNotFoundException('Event', eventId));
  // //     return;
  // //   }
  // //   const { loggedInUser } = res.locals;
  // //   const { userId, numberOfLikes } = req.body;
  // //   const {
  // //     hostUser: { id: hostUserId }
  // //   } = event;
  // //   const { id: loggedInUserId } = loggedInUser;

  // //   if (typeof numberOfLikes === 'undefined') {
  // //     next(new InvalidRequestException('EventUser', ['numberOfLikes']));
  // //     return;
  // //   }

  // //   const eventUser = await EventUsersRepo.findEventUser(eventId, userId);
  // //   if (!eventUser) {
  // //     next(new AccessDeniedException(loggedInUserId, 'Cannot update user booking'));
  // //     return;
  // //   }
  // //   const session = await EventsRepo.getSession();
  // //   session.startTransaction();
  // //   try {
  // //     const opts = { session };
  // //     const eventUserToUpdate = Object.assign(eventUser, { numberOfLikes });
  // //     const newEventUser = await EventUsersRepo.saveOrUpdate(eventUserToUpdate, opts);

  // //     await session.commitTransaction();
  // //     await EventsRepo.endSession();
  // //     res.json({ code: 'SUCCESS', data: newEventUser });
  // //   } catch (err) {
  // //     await session.abortTransaction();
  // //     await EventsRepo.endSession();
  // //     next(err);
  // //   }
  // // };

  // getEventDiscountRolesByScriptAndShop = async (req: Request, res: Response, next: NextFunction) => {
  //   const { scriptId, shopId } = req.params;
  //   if (!shopId) {
  //     next(new ResourceNotFoundException('Shop', shopId));
  //     return;
  //   }
  //   if (!scriptId) {
  //     next(new ResourceNotFoundException('Script', scriptId));
  //     return;
  //   }

  //   const availableDiscountRules = await this.generateAvailableDiscountRules(scriptId, shopId);
  //   // console.log(availableDiscountRules);
  //   res.json({
  //     code: 'SUCCESS',
  //     data: availableDiscountRules
  //   });
  // };

  // getAvailableDiscountRules = async (req: Request, res: Response, next: NextFunction) => {
  //   const { scriptId, shopId } = req.params;
  //   const { startTime } = req.query;
  //   const { loggedInUser } = res.locals;
  //   if (!shopId) {
  //     next(new ResourceNotFoundException('Shop', shopId));
  //     return;
  //   }
  //   if (!scriptId) {
  //     next(new ResourceNotFoundException('Script', scriptId));
  //     return;
  //   }

  //   const availableDiscountRules = await this.generateAvailableDiscountRules(scriptId, shopId, startTime);
  //   // console.log(availableDiscountRules);
  //   res.json({
  //     code: 'SUCCESS',
  //     data: availableDiscountRules
  //   });
  // };

  // generateAvailableDiscountRules = async (scriptId: string, shopId: string, startTime: string = undefined) => {
  //   const availableDiscountRulesRaw = await this.getAvailableDiscountRulesFromDB(scriptId, shopId, startTime);
  //   // console.log(availableDiscountRulesRaw);
  //   const availableDiscountRules = availableDiscountRulesRaw
  //     .filter(rule => {
  //       const { discountRule } = rule;
  //       // console.log(startTime);
  //       // console.log(rule);
  //       return discountRule != null && !this.hasException(startTime, discountRule);
  //     })
  //     .map(rule => {
  //       // console.log(rule);
  //       const { discountRule } = rule;
  //       return discountRule;
  //     });
  //   logger.info(`Found available discountRules, ${availableDiscountRules}, for script ${scriptId}, shopId ${shopId}, startTime ${startTime}`);
  //   return availableDiscountRules;
  // };

  // hasException = (startTime: string, discountRule) => {
  //   const { _id, exception } = discountRule;
  //   const formattedDate = getDate(startTime);
  //   let hasException = false;
  //   if (exception) {
  //     const { dates } = exception;
  //     if (dates.indexOf(formattedDate) !== -1) {
  //       logger.warn(`Found exception for rule: ${_id}, startTime: ${startTime}`);
  //       hasException = true;
  //     }
  //   }
  //   return hasException;
  // };

  // getAvailableDiscountRulesFromDB = async (scriptId: string, shopId: string, startTime: string = undefined) => {
  //   let result = await DiscountRulesMapRepo.findByShopAndScript(shopId, scriptId, startTime);
  //   if (result.length === 0) {
  //     result = await DiscountRulesMapRepo.findByShopAndScript(shopId, undefined, startTime);
  //   }
  //   return result;
  // };

  // /**
  //  * Only host can cancel event.
  //  *
  //  * @param {Request}      req  [description]
  //  * @param {Response}     res  [description]
  //  * @param {NextFunction} next [description]
  //  */
  // cancelEvent = async (req: Request, res: Response, next: NextFunction) => {
  //   const { eventId } = req.params;
  //   const event = await EventService.findById(eventId);
  //   if (!event) {
  //     next(new ResourceNotFoundException('Event', eventId));
  //     return;
  //   }
  //   const { status: currentStatus } = event;
  //   if (currentStatus === 'complelted') {
  //     next(new EventCannotCancelException(eventId));
  //     return;
  //   }

  //   const { loggedInUser } = res.locals;
  //   const { hostUser, supportPayment } = event;
  //   const { id: hostUserId } = hostUser;
  //   const { id: loggedInUserId } = loggedInUser;
  //   if (loggedInUser.id != hostUser.id) {
  //     next(new AccessDeniedException(loggedInUser._id, 'Only host can cancel event'));
  //     return;
  //   }
  //   const session = await EventsRepo.getSession();
  //   session.startTransaction();
  //   try {
  //     const opts = { session };
  //     const status = 'cancelled';
  //     const eventToUpdate = Object.assign(event.toObject(), { status });
  //     const newEvent = await EventsRepo.saveOrUpdate(eventToUpdate, opts);
  //     if (supportPayment) {
  //       logger.info(`Event is payment enabled, cancel all paid bookings if exists`);
  //       await EventService.cancelBookings(event, 'event_cancelled', '退款 - 参团人取消', true, opts);
  //     }
  //     await session.commitTransaction();
  //     await EventsRepo.endSession();
  //     await CacheService.purgeEventCache(newEvent, req);
  //     res.json({ code: 'SUCCESS', data: newEvent });
  //   } catch (err) {
  //     await session.abortTransaction();
  //     await EventsRepo.endSession();
  //     next(err);
  //   }
  // };

  // /**
  //  * Only host can complete event.
  //  *
  //  * @param {Request}      req  [description]
  //  * @param {Response}     res  [description]
  //  * @param {NextFunction} next [description]
  //  */
  // completeEvent = async (req: Request, res: Response, next: NextFunction) => {
  //   const { eventId } = req.params;
  //   const event = await EventService.findById(eventId);
  //   if (!event) {
  //     next(new ResourceNotFoundException('Event', eventId));
  //     return;
  //   }
  //   const { status } = req.body;
  //   const { loggedInUser } = res.locals;

  //   const {
  //     hostUser,
  //     supportPayment,
  //     script: { _id: scriptId },
  //     shop: { _id: shopId },
  //     startTime,
  //     discountRule: originalDiscountRule
  //   } = event;
  //   const { id: hostUserId } = hostUser;
  //   const { id: loggedInUserId, roles } = loggedInUser;
  //   const topRole = getTopRole(roles);
  //   if (topRole !== 'admin' && loggedInUser.id != hostUser.id) {
  //     next(new AccessDeniedException(loggedInUser._id, 'Only host or admin can complete event'));
  //     return;
  //   }

  //   if (['completed'].indexOf(status) == -1) {
  //     next(new InvalidRequestException('Event', ['status']));
  //     return;
  //   }
  //   // get participators for given event
  //   const eventUsers = await EventUsersRepo.findByEvent(eventId);
  //   let newEvent = await this.updateEventParticpantsNumber(event, eventUsers);
  //   if (!this.canCompleteEvent(event, eventUsers)) {
  //     next(new EventCannotCompleteException(eventId));
  //     return;
  //   }

  //   const applicableDiscountRules = await this.generateAvailableDiscountRules(scriptId, shopId, startTime);
  //   // if more than one discount found or the found discountRule is not same as the one one in db, it's an error!
  //   let discountRule = undefined;
  //   if (applicableDiscountRules.length > 0) {
  //     if (applicableDiscountRules.length > 1) {
  //       logger.error(`More than one discountRules found`);
  //       next(new EventCannotCompleteException(eventId));
  //       return;
  //     }
  //     discountRule = applicableDiscountRules[0]._id;
  //   }
  //   if (!this.isSameDiscountRule(originalDiscountRule, discountRule)) {
  //     logger.error(`Different discount rule found`);
  //     next(new EventCannotCompleteException(eventId));
  //     return;
  //   }

  //   const session = await EventsRepo.getSession();
  //   session.startTransaction();
  //   try {
  //     const opts = { session };
  //     const eventToUpdate = Object.assign(newEvent, { status });
  //     newEvent = await EventsRepo.saveOrUpdate(eventToUpdate, opts);
  //     newEvent = await EventService.findById(eventId);
  //     const eventCommissions = this.generateEventCommission(newEvent, eventUsers);
  //     // console.log(eventCommissions);
  //     if (eventCommissions) {
  //       await EventsRepo.saveEventCommissions(eventCommissions, opts);
  //       if (supportPayment) {
  //         logger.info(`Event is payment enabled, creating commission coupons if exists`);
  //         const refunds = await EventService.createCommissionCoupons(eventCommissions, opts);
  //         logger.info(`Created ${refunds.length} commission coupons`);
  //       }
  //     }
  //     // await UserService.saveUserRewardsWhenEventCompleted(newEvent, opts);
  //     await MessageService.saveCompleteEventNotifications(newEvent, eventCommissions, opts);
  //     await session.commitTransaction();
  //     await EventsRepo.endSession();
  //     await CacheService.purgeEventCache(newEvent, req);
  //     await CacheService.purgeUserCache(getUserIds(eventCommissions));
  //     res.json({ code: 'SUCCESS', data: newEvent });
  //   } catch (err) {
  //     await session.abortTransaction();
  //     await EventsRepo.endSession();
  //     next(err);
  //   }
  // };

  // isSameDiscountRule(discountRule1, discountRule2) {
  //   if (!discountRule1 && !discountRule2) {
  //     return true;
  //   }
  //   if ((!discountRule1 && discountRule2) || (discountRule1 && !discountRule2)) {
  //     return false;
  //   }
  //   const { _id: ruleId1 } = discountRule1;
  //   const { _id: ruleId2 } = discountRule2;
  //   return ruleId1.toString() === ruleId2.toString();
  // }

  // generateEventCommission = (event, eventUsers) => {
  //   const { discountRule, hostUser, price } = event;
  //   const totalAmount = price * eventUsers.length;
  //   // console.log(discountRule);
  //   if (discountRule) {
  //     const { discount } = discountRule;
  //     const { invitor: invitorRate, participator: participatorRate } = discount;
  //     // console.log(discount);
  //     // const hostCommission = {
  //     //   user: hostUser,
  //     //   amount: (totalAmount * host) / 100
  //     // };
  //     const participatorCommissions = eventUsers.map(eventUser => {
  //       const { _id, user } = eventUser;
  //       return {
  //         eventUser: _id,
  //         user,
  //         amount: (price * participatorRate) / 100
  //       };
  //     });
  //     const invitorCommissions = eventUsers
  //       .map(eventUser => {
  //         const { _id, invitor } = eventUser;
  //         if (invitor) {
  //           return {
  //             eventUser: _id,
  //             user: invitor,
  //             amount: (price * invitorRate) / 100
  //           };
  //         } else {
  //           return undefined;
  //         }
  //       })
  //       .filter(_ => _);
  //     const commissions = {
  //       participators: participatorCommissions,
  //       invitors: invitorCommissions
  //     };
  //     return {
  //       event,
  //       commissions
  //     };
  //   } else {
  //     return undefined;
  //   }
  // };

  // /**
  //  * Update event participants stats.
  //  *
  //  * @param {[type]} event      [description]
  //  * @param {[type]} eventUsers [description]
  //  */
  // updateEventParticpantsNumber = async (event, eventUsers) => {
  //   const { minNumberOfSpots, maxNumberOfSpots, numberOfOfflinePlayers } = event;
  //   let { minNumberOfAvailableSpots, maxNumberOfAvailableSpots, numberOfPlayers } = event;
  //   if (!minNumberOfAvailableSpots) {
  //     minNumberOfAvailableSpots = 0;
  //   }
  //   if (!maxNumberOfAvailableSpots) {
  //     maxNumberOfAvailableSpots = 0;
  //   }
  //   if (!numberOfPlayers) {
  //     numberOfPlayers = 0;
  //   }
  //   numberOfPlayers = eventUsers.length;
  //   minNumberOfAvailableSpots = minNumberOfSpots - numberOfPlayers - numberOfOfflinePlayers;
  //   if (minNumberOfAvailableSpots < 0) {
  //     minNumberOfAvailableSpots = 0;
  //   }
  //   maxNumberOfAvailableSpots = maxNumberOfSpots - numberOfPlayers - numberOfOfflinePlayers;
  //   if (maxNumberOfAvailableSpots < 0) {
  //     maxNumberOfAvailableSpots = 0;
  //   }
  //   const eventToUpdate = Object.assign(event, {
  //     minNumberOfAvailableSpots,
  //     maxNumberOfAvailableSpots,
  //     numberOfPlayers,
  //     numberOfOfflinePlayers
  //   });
  //   const newEvent = await EventsRepo.saveOrUpdate(eventToUpdate, {});
  //   return newEvent;
  // };

  // canJoinEvent = (event, eventUsers) => {
  //   const { numberOfAvailableSpots, numberOfPlayers, numberOfOfflinePlayers, minNumberOfSpots, maxNumberOfSpots } = event;
  //   const numberOfOnlinePersons = eventUsers.length;
  //   return numberOfOnlinePersons + numberOfOfflinePlayers < maxNumberOfSpots;
  // };

  // isBlacklistedUser = (userId, eventUsers) => {
  //   let blacklisted = false;
  //   for (let i = 0; i < eventUsers.length; i++) {
  //     const eventUser = eventUsers[i];
  //     const {
  //       status,
  //       user: { id: existingUserId }
  //     } = eventUser;
  //     // console.log(userId + ', ' + existingUserId + ', ' + status);
  //     if (status === 'blacklisted' && existingUserId === userId) {
  //       blacklisted = true;
  //       break;
  //     }
  //   }
  //   return blacklisted;
  // };

  // canCompleteEvent = (event, eventUsers) => {
  //   let allPaid = true;
  //   for (let i = 0; i < eventUsers.length; i++) {
  //     const eventUser = eventUsers[i];
  //     const { status } = eventUser;
  //     if (status === 'unpaid') {
  //       allPaid = false;
  //       break;
  //     }
  //   }
  //   // console.log(allPaid);
  //   const { numberOfAvailableSpots, numberOfPlayers, numberOfOfflinePlayers, minNumberOfSpots, maxNumberOfSpots } = event;
  //   const numberOfOnlinePersons = eventUsers.length;
  //   console.log(allPaid + ', ' + numberOfOnlinePersons + ', ' + numberOfOfflinePlayers + ', ' + minNumberOfSpots + ', ' + maxNumberOfSpots);
  //   return allPaid && numberOfOnlinePersons + numberOfOfflinePlayers >= minNumberOfSpots && numberOfOnlinePersons + numberOfOfflinePlayers <= maxNumberOfSpots;
  // };

  // // /**
  // //  * Update event status to expired if endTime is past.
  // //  *
  // //  * @param {Request}      req  [description]
  // //  * @param {Response}     res  [description]
  // //  * @param {NextFunction} next [description]
  // //  */
  // // updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  // //   const { loggedInUser } = res.locals;
  // //   const response = await EventsRepo.updateExpiredEvents();
  // //   const { nModified } = response;
  // //   res.json({ code: 'SUCCESS', data: `${nModified} record(s) are updated` });
  // // };

  // /**
  //  * Archive events which startTime is past and not full.
  //  *
  //  * @param {Request}      req  [description]
  //  * @param {Response}     res  [description]
  //  * @param {NextFunction} next [description]
  //  */
  // archiveEvents = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const response = await EventService.archiveEvents();
  //     // console.log(response);
  //     const { eventIds, affectedRows } = response;
  //     logger.info(`${affectedRows} record(s) has been updated, data: ${eventIds}`);
  //     res.json({
  //       code: 'SUCCESS',
  //       data: `${affectedRows} record(s) has been updated`
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // getEventQrCode = async (req: Request, res: Response, next: NextFunction) => {
  //   const { appName, eventId } = req.params;
  //   try {
  //     const response = await EventService.getQrCode(appName, eventId);
  //     // console.log(response);
  //     res.json({ code: 'SUCCESS', data: response });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // getEventOrders = async (req: Request, res: Response, next: NextFunction) => {
  //   const { eventId } = req.params;
  //   const { loggedInUser } = res.locals;
  //   const event = await EventService.findById(eventId, {
  //     status: ['ready', 'completed', 'expired', 'cancelled']
  //   });
  //   if (!event) {
  //     next(new ResourceNotFoundException('Event', eventId));
  //     return;
  //   }
  //   try {
  //     const orders = await OrderService.getOrderByEvent(event);

  //     res.json({ code: 'SUCCESS', data: orders });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // inviteUser = async (req: Request, res: Response, next: NextFunction) => {
  //   const { eventId } = req.params;
  //   const { loggedInUser } = res.locals;
  //   try {
  //     const event = await EventService.findById(eventId);
  //     if (!event) {
  //       throw new ResourceNotFoundException('Event', eventId);
  //     }
  //     const { status } = event;
  //     if (status !== 'ready') {
  //       throw new EventCannotInviteException(eventId);
  //     }
  //     const { inviteeMobile } = req.body;

  //     const userInvitation = await EventService.inviteUser(loggedInUser, event, inviteeMobile);
  //     res.json({ code: 'SUCCESS', data: userInvitation });
  //   } catch (err) {
  //     next(err);
  //   }
  // };
}
