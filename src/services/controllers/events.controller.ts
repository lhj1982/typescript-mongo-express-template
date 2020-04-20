import { Route, Get, Post, Put, SuccessResponse, Tags, Body, Path, Query, OperationId, Request, Response, Security } from 'tsoa';
import { IAddEventRequest, IUpdateEventRequest, IUpdateEventUserStatusRequest, IJoinEventRequest, ICancelEventUserRequest, ICompleteEventRequest, IInviteUserRequest } from '../requests';
import { IResponse, IErrorResponse } from '../responses';
import GenericController from './generic.controller';
import config from '../../config';
import logger from '../../middleware/logger.middleware';

import { InvalidRequestException, ResourceNotFoundException, AccessDeniedException, EventCannotCancelException, EventCannotInviteException } from '../../exceptions/custom.exceptions';
import EventService from '../svcs/event.service';
// import { BaseController } from '../base.controller';
// import MessageService from '../services/message.service';
// import EventService from '../services/event.service';
import OrderService from '../svcs/order.service';
// import CacheService from '../services/cache.service';
import ScriptService from '../svcs/script.service';
import ShopService from '../svcs/shop.service';
import UserService from '../svcs/user.service';
import EventUserService from '../svcs/eventUser.service';

import { getTopRole } from '../../utils/user';

@Route('/events')
export class EventsController extends GenericController {
  /**
   * Get events list by given date.
   *
   * @param {[type]} '/calendar/{date}' [description]
   */
  @Get('/calendar/{date}')
  @Tags('event')
  @OperationId('getEventsByDate')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getEventsByDate(@Path('date') date: string, @Query() status?: string): Promise<IResponse> {
    try {
      // const offset = 0;
      // const limit = 100;
      // const { date } = req.params;
      // const { status } = req.query;
      // default status filter
      let statusArr = ['ready', 'completed', 'expired'];
      if (status) {
        statusArr = status.split(',');
      }
      const result = await EventService.findByDate(date, {
        status: statusArr
      });
      return { code: 'SUCCESS', data: result };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Get number of events by given date in which the whole month it falls. date format: YYYY-MM
   *
   * @param {Request}      req  [description]
   * @param {Response}     res  [description]
   * @param {NextFunction} next [description]
   */
  @Get('/calendar/{date}/count')
  @Tags('event')
  @OperationId('getEventsCountByDate')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getEventsCountByDate(@Path('date') date: string, @Query() status?: string): Promise<IResponse> {
    try {
      // const { date: dateStr } = req.params;
      // const { status } = req.query;
      let statusArr = ['ready', 'completed', 'expired'];
      if (status) {
        statusArr = status.split(',');
      }
      const result = await EventService.findEventsCountByDate(date, {
        status: statusArr
      });
      return { code: 'SUCCESS', data: result };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Retrieve price schema of event.
   *
   * @param {[type]} '/calendar/{date}/count' [description]
   */
  @Get('/price-schema')
  @Tags('event')
  @OperationId('getEventPriceSchema')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getPriceWeeklySchema(@Query() scriptId?: string, @Query() shopId?: string): Promise<IResponse> {
    // const { scriptId, shopId } = req.query;
    try {
      const script = await ScriptService.findById(scriptId);
      const shop = await ShopService.findById(shopId);
      if (!shop) {
        throw new ResourceNotFoundException('Shop', shopId);
      }
      if (!script) {
        throw new ResourceNotFoundException('Script', scriptId);
      }
      const priceWeeklySchema = await EventService.findPriceWeeklySchemaByEvent(script, shop);
      return { code: 'SUCCESS', data: priceWeeklySchema };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Retrieve available discount rules.
   *
   * @param {[type]} '/price-schema' [description]
   */
  @Get('/discount-rules')
  @Tags('event')
  @OperationId('getDiscountRules')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getDiscountRules(@Query() shopId: string, @Query() scriptId?: string): Promise<IResponse> {
    // const { scriptId, shopId } = req.query;
    try {
      let script = undefined;
      if (scriptId) {
        script = await ScriptService.findById(scriptId);
      }
      const shop = await ShopService.findById(shopId);
      if (!shop) {
        throw new ResourceNotFoundException('Shop', shopId);
      }
      const discountRules = await EventService.findDiscountRulesByShopAndScript(shop, script);
      return { code: 'SUCCESS', data: discountRules };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Archive events which startTime is past and not full.
   *
   * @param {Request}      req  [description]
   * @param {Response}     res  [description]
   * @param {NextFunction} next [description]
   */
  @Get('/archive-events')
  @Tags('event')
  @OperationId('archiveEvents')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async archiveEvents(): Promise<IResponse> {
    try {
      const response = await EventService.archiveEvents();
      // console.log(response);
      const { eventIds, affectedRows } = response;
      logger.info(`${affectedRows} record(s) has been updated, data: ${eventIds}`);
      return {
        code: 'SUCCESS',
        data: `${affectedRows} record(s) has been updated`
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * List events.
   *
   * @param {Request}      req  [description]
   * @param {Response}     res  [description]
   * @param {NextFunction} next [description]
   */
  @Get()
  @Tags('event')
  @OperationId('listEvents')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getEvents(@Request() req: any, @Query() filter?: any, @Query() keyword?: string, @Query() sort?: any, @Query() offset?: number, @Query() limit?: number): Promise<IResponse> {
    try {
      // let offset = parseInt(req.query.offset);
      // let limit = parseInt(req.query.limit);
      // const { keyword, filter: filterStr, sort: sortStr } = req.query;
      let filterToUpdate = { status: ['ready'], availableSpots: -1 };
      let sortToUpdate = {};
      if (filter) {
        const decodedFilter = JSON.parse(decodeURIComponent(filter));
        filterToUpdate = Object.assign(filterToUpdate, decodedFilter);
        // console.log(filterToUpdate);
      }
      if (sort) {
        const decodedSort = JSON.parse(decodeURIComponent(sort));
        sortToUpdate = Object.assign(sortToUpdate, decodedSort);
      }
      if (!offset) {
        offset = config.query.offset;
      }
      if (!limit) {
        limit = config.query.limit;
      }
      // console.log(filterToUpdate);
      let result = await EventService.find({ keyword, offset, limit }, filterToUpdate, sortToUpdate);
      const links = this.generateLinks(result.pagination, req.originalUrl, '');
      result = Object.assign({}, result, links);
      return { code: 'SUCCESS', data: result };
    } catch (err) {
      throw err;
    }
  }

  @Post('/')
  @Tags('event')
  @OperationId('addEvent')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async addEvent(@Body() body: IAddEventRequest, @Request() req: any): Promise<IResponse> {
    try {
      const { shopId, scriptId, startTime, hostUserId, hostUserMobile } = body;
      // const { numberOfOfflinePlayers, isHostJoin, supportPayment } = body;
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
      // if (!hostUserWechatId) {
      //   throw new InvalidRequestException('AddEvent', ['hostUserWechatId']);
      // }
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

  /**
   * Update event status, numberOfOfflinePlayers
   *
   * @param {Request}      req  [description]
   * @param {Response}     res  [description]
   * @param {NextFunction} next [description]
   */
  @Put('/{eventId}')
  @Tags('event')
  @OperationId('updateEventById')
  @Security('access_token', ['event:updateEventById'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async updateEvent(@Request() req: any, @Path('eventId') eventId: string, @Body() body: IUpdateEventRequest): Promise<IResponse> {
    // const { user: loggedInUser } = req;
    const event = await EventService.findById(eventId);
    if (!event) {
      throw new ResourceNotFoundException('Event', eventId);
    }

    try {
      const newEvent = await EventService.updateEvent(event, body);
      return { code: 'SUCCESS', data: newEvent };
    } catch (err) {
      throw err;
    }
  }

  /**
   * User choose to join the event.
   *
   * @param {Request}      req  [description]
   * @param {Response}     res  [description]
   * @param {NextFunction} next [description]
   */
  @Post('{eventId}/join')
  @Tags('event')
  @OperationId('joinEvent')
  @Security('access_token', ['event-user:joinEvent'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async joinUserEvent(@Request() req: any, @Path('eventId') eventId: string, @Body() body: IJoinEventRequest): Promise<IResponse> {
    // const { eventId } = req.params;
    const { userName, source, userId, wechatId } = body;
    const { user: loggedInUser } = req;
    const event = await EventService.findById(eventId);
    try {
      if (!event) {
        throw new ResourceNotFoundException('Event', eventId);
      }
      if (userId && userName) {
        throw new InvalidRequestException('JoinEvent', ['userId', 'userName']);
      }
      if (source != 'online' && source != 'offline') {
        throw new InvalidRequestException('JoinEvent', ['source']);
      }
      if (source === 'online' && !userId) {
        throw new InvalidRequestException('JoinEvent', ['source', 'userId']);
      }
      if (source === 'offline' && !userName) {
        throw new InvalidRequestException('JoinEvent', ['source', 'userName']);
      }
      if (!wechatId) {
        throw new InvalidRequestException('JoinEvent', ['wechatId']);
      }
      if (userId != loggedInUser.id) {
        throw new AccessDeniedException(userId, 'You are only join event yourself');
      }
      // if (userId) {
      //   const user = await UsersRepo.findById(userId);
      //   if (!user) {
      //     next(new ResourceNotFoundException('User', userId));
      //     return;
      //   }
      // }
      const result = await EventService.joinEvent(loggedInUser, event, body);
      return {
        code: 'SUCCESS',
        data: result
      };
    } catch (err) {
      throw err;
    }
  }

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

  /**
   * Get an event detail info.
   *
   * @param {[type]} '/{eventId}' [description]
   */
  @Get('/{eventId}')
  @Tags('event')
  @OperationId('getEventById')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getEventDetails(@Path('eventId') eventId: string): Promise<IResponse> {
    try {
      const resp = await EventService.findDetailById(eventId);
      return {
        code: 'SUCCESS',
        data: resp
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get an event simplified detail info.
   *
   * @param {[type]} '/{eventId}/simplified' [description]
   */
  @Get('/{eventId}/simplified')
  @Tags('event')
  @OperationId('getSimplifiedEventById')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getEventDetailsSimplified(@Path('eventId') eventId: string): Promise<IResponse> {
    try {
      // const { eventId } = req.params;
      const event = await EventService.findByIdSimplified(eventId);
      return {
        code: 'SUCCESS',
        data: event
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Cancel a user event.
   * User choose not to join a given event. User can only cancel his own booking, host can cancel others booking, and can blacklist user as well.
   *
   * @param {Request}      req  [description]
   * @param {Response}     res  [description]
   * @param {NextFunction} next [description]
   */
  @Put('/{eventId}/users/cancel')
  @Tags('event')
  @OperationId('cancelEventUser')
  @Security('access_token', ['event-user:cancelEventUser'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async cancelEventUser(@Request() req: any, @Path('eventId') eventId: string, @Body() body: ICancelEventUserRequest): Promise<IResponse> {
    // const { eventId } = req.params;
    try {
      const event = await EventService.findById(eventId);
      if (!event) {
        throw new ResourceNotFoundException('Event', eventId);
      }
      const {
        hostUser: { id: hostUserId }
      } = event;
      const { user: loggedInUser } = req;
      const { userId, status } = body;

      if (status != 'cancelled' && status != 'blacklisted') {
        throw new InvalidRequestException('EventUser', ['status']);
      }

      if (status === 'cancelled') {
        if (loggedInUser.id != hostUserId && loggedInUser.id != userId) {
          throw new AccessDeniedException(loggedInUser.id, 'You are not a host or you are trying to cancel others booking');
        }
      }

      if (status === 'blacklisted' && hostUserId != loggedInUser.id) {
        throw new AccessDeniedException(loggedInUser.id, 'Only host can blacklist user');
      }
      const userToCancel = await UserService.findById(userId);
      const newEventUser = await EventService.cancelEventUser(event, userToCancel, body);
      return { code: 'SUCCESS', data: newEventUser };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update a user event status. Orgnizer can update a user event status to paid/unpaid.
   *
   * @param {Request}      req  [description]
   * @param {Response}     res  [description]
   * @param {NextFunction} next [description]
   */
  @Put('/{eventId}/users/update-status')
  @Tags('event')
  @OperationId('updateEventUserStatus')
  @Security('access_token', ['event-user:updateEventUserStatus'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async updateEventUserStatus(@Request() req: any, @Path('eventId') eventId: string, @Body() body: IUpdateEventUserStatusRequest): Promise<IResponse> {
    // const { eventId } = req.params;
    const event = await EventService.findById(eventId);
    if (!event) {
      throw new ResourceNotFoundException('Event', eventId);
    }
    const { user: loggedInUser } = req;
    const { userId, status } = body;
    if (['paid', 'unpaid'].indexOf(status) == -1) {
      throw new InvalidRequestException('EventUser', ['status']);
    }
    // if (userId != loggedInUser._id) {
    // 	next(new AccessDeniedException(''));
    // }
    const { hostUser } = event;
    const { id: hostUserId } = hostUser;
    const { id: loggedInUserId } = loggedInUser;
    if (loggedInUserId != hostUserId) {
      throw new AccessDeniedException(loggedInUser._id, 'Only host can update status');
    }
    try {
      const user = await UserService.findById(userId);
      const eventUser = await EventUserService.findEventUser(event, user);
      const eventUserToUpdate = Object.assign(eventUser, { status: status });
      const newEventUser = EventUserService.update(eventUserToUpdate);
      return { code: 'SUCCESS', data: newEventUser };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Only host can cancel event.
   *
   * @param {Request}      req  [description]
   * @param {Response}     res  [description]
   * @param {NextFunction} next [description]
   */
  @Put('/{eventId}/cancel')
  @Tags('event')
  @OperationId('cancelEvent')
  @Security('access_token', ['event:cancelEvent'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async cancelEvent(@Request() req: any, @Path('eventId') eventId: string): Promise<IResponse> {
    // const { eventId } = req.params;
    try {
      const event = await EventService.findById(eventId);
      if (!event) {
        throw new ResourceNotFoundException('Event', eventId);
      }
      const { status: currentStatus } = event;
      if (currentStatus === 'complelted') {
        throw new EventCannotCancelException(eventId);
      }

      const { user: loggedInUser } = req;
      const { hostUser } = event;
      const { id: hostUserId } = hostUser;
      const { id: loggedInUserId } = loggedInUser;
      if (loggedInUserId != hostUserId) {
        throw new AccessDeniedException(loggedInUserId, 'Only host can cancel event');
      }
      const newEvent = await EventService.cancelEvent(event);
      return { code: 'SUCCESS', data: newEvent };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Mark an event to complete, only when it's fully booked.
   *
   * @summary Mark an event to complete.
   * @param {Request}      req  [description]
   * @param {Response}     res  [description]
   * @param {NextFunction} next [description]
   */
  @Put('/{eventId}/complete')
  @Tags('event')
  @OperationId('completeEvent')
  @Security('access_token', ['event:completeEvent'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async completeEvent(@Request() req: any, @Path('eventId') eventId: string, @Body() body: ICompleteEventRequest): Promise<IResponse> {
    // const { eventId } = req.params;
    try {
      const event = await EventService.findById(eventId);
      if (!event) {
        throw new ResourceNotFoundException('Event', eventId);
      }
      const { status } = body;
      const { user: loggedInUser } = req;

      const { hostUser } = event;
      const { id: hostUserId } = hostUser;
      const { id: loggedInUserId, roles } = loggedInUser;
      const topRole = getTopRole(roles);
      if (topRole !== 'admin' && loggedInUserId != hostUserId) {
        throw new AccessDeniedException(loggedInUser._id, 'Only host or admin can complete event');
      }

      if (['completed'].indexOf(status) == -1) {
        throw new InvalidRequestException('Event', ['status']);
      }

      const newEvent = await EventService.completeEvent(event, status);
      return { code: 'SUCCESS', data: newEvent };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Generate event detail QR code.
   *
   * @summary Generate event detail QR code.
   * @param {string} eventId event id to share
   * @param {string} appName wx app name it applies
   */
  @Get('/{eventId}/qrcode/{appName}')
  @Tags('event')
  @OperationId('getEventQRcode')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getEventQrCode(@Path('eventId') eventId: string, @Path('appName') appName: string): Promise<IResponse> {
    // const { appName, eventId } = req.params;
    try {
      const response = await EventService.getQrCode(appName, eventId);
      // console.log(response);
      return { code: 'SUCCESS', data: response };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get orders and refunds for given event.
   *
   * @param {Request}      req  [description]
   * @param {Response}     res  [description]
   * @param {NextFunction} next [description]
   */
  @Get('/{eventId}/orders')
  @Tags('event')
  @OperationId('getEventOrders')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getEventOrders(@Path('eventId') eventId: string): Promise<IResponse> {
    try {
      // const { user: loggedInUser } = req;
      const event = await EventService.findById(eventId, {
        status: ['ready', 'completed', 'expired', 'cancelled']
      });
      if (!event) {
        throw new ResourceNotFoundException('Event', eventId);
      }
      const orders = await OrderService.getOrderByEvent(event);

      return { code: 'SUCCESS', data: orders };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Invite user to join a event. Invite user to join a event using a invitation code
   *
   * @param {[type]} '/{eventId}/invite' [description]
   */
  @Post('/{eventId}/invite')
  @Tags('event')
  @OperationId('inviteEventUser')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async inviteUser(@Request() req: any, @Path('eventId') eventId: string, @Body() body: IInviteUserRequest): Promise<IResponse> {
    // const { eventId } = req.params;
    const { user: loggedInUser } = req;
    try {
      const event = await EventService.findById(eventId);
      if (!event) {
        throw new ResourceNotFoundException('Event', eventId);
      }
      const { status } = event;
      if (status !== 'ready') {
        throw new EventCannotInviteException(eventId);
      }
      const { inviteeMobile } = body;

      const userInvitation = await EventService.inviteUser(loggedInUser, event, inviteeMobile);
      return { code: 'SUCCESS', data: userInvitation };
    } catch (err) {
      throw err;
    }
  }

  /**
   * List all events by given script and shop.
   * @param {[type]} '/script/{scriptId}/shop/{shopId}' [description]
   */
  @Get('/{scriptId}/{shopId}')
  @Tags('event')
  @OperationId('listEventsByScriptAndShop')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getEventsByScriptAndShop(
    @Request() req: any,
    @Path('scriptId') scriptId: string,
    @Path('shopId') shopId: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number
  ): Promise<IResponse> {
    try {
      // console.log(req);
      // let offset = parseInt(req.query.offset);
      // let limit = parseInt(req.query.limit);
      // const { scriptId, shopId } = req.params;
      if (!offset) {
        offset = config.query.offset;
      }
      if (!limit) {
        limit = config.query.limit;
      }
      const script = await ScriptService.findById(scriptId);
      const shop = await ShopService.findById(shopId);
      let result = await EventService.find({ script, shop, offset, limit });
      const links = this.generateLinks(result.pagination, req.originalUrl, '');
      result = Object.assign({}, result, links);
      return { code: 'SUCCESS', data: result };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Retrieve all discount rules for given shop and script.
   *
   * @param {[type]} '{scriptId}/{shopId}/discount-rules' [description]
   */
  @Get('/{scriptId}/{shopId}/discount-rules')
  @Tags('event')
  @OperationId('getDiscountRules')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getEventDiscountRolesByScriptAndShop(@Path('scriptId') scriptId: string, @Path('shopId') shopId: string): Promise<IResponse> {
    // const { scriptId, shopId } = req.params;
    try {
      if (!shopId) {
        throw new ResourceNotFoundException('Shop', shopId);
      }
      if (!scriptId) {
        throw new ResourceNotFoundException('Script', scriptId);
      }
      const shop = await ShopService.findById(shopId);
      const script = await ScriptService.findById(scriptId);

      const availableDiscountRules = await EventService.generateAvailableDiscountRules(script, shop);
      // console.log(availableDiscountRules);
      return {
        code: 'SUCCESS',
        data: availableDiscountRules
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Retrieve available discount rules.
   *
   * @param {[type]} '/{scriptId}/{shopId}/available-discount-rules' [description]
   */
  @Get('/{scriptId}/{shopId}/available-discount-rules')
  @Tags('event')
  @OperationId('getAvailableDiscountRules')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getAvailableDiscountRules(@Request() req: any, @Path('scriptId') scriptId: string, @Path('shopId') shopId: string, @Query('startTime') startTime?: string): Promise<IResponse> {
    // const { user: loggedInUser } = req;
    try {
      const shop = await ShopService.findById(shopId);
      const script = await ScriptService.findById(scriptId);
      if (!shop) {
        throw new ResourceNotFoundException('Shop', shopId);
      }
      if (!script) {
        throw new ResourceNotFoundException('Script', scriptId);
      }

      const availableDiscountRules = await EventService.generateAvailableDiscountRules(script, shop, startTime);
      // console.log(availableDiscountRules);
      return {
        code: 'SUCCESS',
        data: availableDiscountRules
      };
    } catch (err) {
      throw err;
    }
  }
}
