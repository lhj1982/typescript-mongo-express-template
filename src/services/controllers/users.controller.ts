// import { Request, Response as HttpResponse, NextFunction } from 'express';
import { Route, Path, Controller, Post, BodyProp, Get, Put, Delete, SuccessResponse, Tags, Body, OperationId, Request, Response, Security } from 'tsoa';
import { IResponse, IErrorResponse, IUserResponse } from '../responses';
import { IUpdateUserRequest } from '../requests';

import AuthApi from '../api/auth';
import { InvalidRequestException, ResourceAlreadyExist, ResourceNotFoundException, AccessDeniedException } from '../../exceptions/custom.exceptions';
// import UsersRepo from '../repositories/users.repository';
// import EventUsersRepo from '../repositories/eventUsers.repository';
// import EventsRepo from '../repositories/events.repository';
// import TagsRepo from '../repositories/tags.repository';
// import EventService from '../services/event.service';
import UserService from '../svcs/user.service';
import CacheService from '../svcs/cache.service';
import * as _ from 'lodash';
import config from '../../config';

@Route('/users')
export class UsersController {
  // getUsers = async (req: Request, res: Response) => {
  //   try {
  //     const contact = await UsersRepo.find({});
  //     res.json(contact);
  //   } catch (err) {
  //     res.send(err);
  //   }
  // };

  // sendInvitation = (req: Request, res: Response) => {
  //   const { openId } = req.body;
  // };

  // getAccessToken = async (req: Request, res: Response) => {
  //   const { appName } = req.params;
  //   const response = await AuthApi.getAccessToken(appName);
  //   // UserRepo.saveAccessToken();
  //   res.json(response);
  //   // return response;
  // };

  @Get('/{userId}')
  @Tags('user')
  @OperationId('getUserDetailById')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getUserDetails(@Path('userId') userId: string, @Request() req: any): Promise<IResponse> {
    const { user: loggedInUser } = req;
    const { status } = req.query;

    if (userId && userId != loggedInUser.id) {
      throw new AccessDeniedException(userId, 'You can only show your own profile');
    }
    try {
      // default status filter
      let statusArr = ['ready', 'completed', 'expired'];
      if (status) {
        statusArr = status.split(',');
      }
      const user = await UserService.findById(userId);
      // const events = await EventsRepo.findEventsByUser(userId, {
      //   status: statusArr
      // });
      const events = [];
      const response = Object.assign(user, { events });
      return { code: 'SUCCESS', data: response };
    } catch (err) {
      throw err;
    }
  }

  @Put('/{userId}')
  @Tags('user')
  @OperationId('updateUser')
  @Security('access_token', ['user:updateUser'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async updateUser(@Path('userId') userId: string, @Body() body: IUpdateUserRequest, @Request() req: any): Promise<IResponse> {
    try {
      const user = await UserService.findById(userId);
      if (!user) {
        throw new ResourceNotFoundException('User', userId);
      }
      const { nickName, gender, description, city, email, mobile, wechatId, company, avatarImage, ageTag } = body;
      const userToUpdate = Object.assign(user, {
        nickName,
        gender,
        city,
        description,
        email,
        mobile,
        wechatId,
        company,
        avatarImage,
        ageTag
      });
      const updatedUser = await UserService.saveOrUpdate(user);
      await CacheService.purgeUserCache([userId]);
      return { code: 'SUCCESS', data: updatedUser };
    } catch (err) {
      throw err;
    }
  }

  // getMyEvents = async (req: Request, res: Response, next: NextFunction) => {
  //   const { loggedInUser } = res.locals;
  //   if (!loggedInUser) {
  //     next(new AccessDeniedException(''));
  //     return;
  //   }
  //   const { status } = req.query;
  //   // default status filter
  //   let statusArr = ['ready', 'completed', 'expired'];
  //   if (status) {
  //     statusArr = status.split(',');
  //   }
  //   const events = await EventsRepo.findEventsByUser(loggedInUser._id, {
  //     status: statusArr
  //   });
  //   res.json({ code: 'SUCCESS', data: events });
  // };

  // getTokenStatus = async (req: Request, res: Response, next: NextFunction) => {
  //   const { tokenIssuedAt, tokenExpiredAt, loggedInUser } = res.locals;
  //   res.json({
  //     code: 'SUCCESSS',
  //     data: {
  //       tokenIssuedAt,
  //       tokenExpiredAt,
  //       userId: loggedInUser.id,
  //       openId: loggedInUser.openId
  //     }
  //   });
  // };

  // blockUser = async (req: Request, res: Response, next: NextFunction) => {
  //   const { loggedInUser } = res.locals;
  //   if (!loggedInUser) {
  //     next(new AccessDeniedException(''));
  //     return;
  //   }
  //   try {
  //     const { userId } = req.params;
  //     const user = await UsersRepo.findById(userId);
  //     if (!user) {
  //       next(new ResourceNotFoundException('User', userId));
  //       return;
  //     }
  //     const userToUpdate = Object.assign(user.toObject(), {
  //       status: 'blocked'
  //     });
  //     const newUser = await UsersRepo.saveOrUpdateUser(userToUpdate);
  //     res.json({ code: 'SUCCESS', data: newUser });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // getPhoneEncryptedData = async (req: Request, res: Response, next: NextFunction) => {
  //   const { loggedInUser } = res.locals;
  //   if (!loggedInUser) {
  //     next(new AccessDeniedException(''));
  //     return;
  //   }
  //   const { body } = req;
  //   const { appName } = body;
  //   try {
  //     // console.log(body);
  //     const response = await UserService.getWechatEncryptedData(config['appName'][appName]['appId'], body);
  //     const result = {
  //       phoneNumber: response.phoneNumber,
  //       countryCode: response.countryCode
  //     };
  //     res.json({ code: 'SUCCESS', data: response });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // addUserTag = async (req: Request, res: Response, next: NextFunction) => {
  //   const { loggedInUser } = res.locals;
  //   const { userId } = req.params;
  //   const {
  //     body: { tagId, type, objectId }
  //   } = req;
  //   try {
  //     const { _id: loggedInUserId } = loggedInUser;
  //     if (userId === loggedInUserId.toString()) {
  //       next(new AccessDeniedException(loggedInUserId, 'You are not allowed to tag yourself'));
  //       return;
  //     }
  //     const eventUser = undefined;
  //     if (type === 'event_user') {
  //       const eventUser = await EventUsersRepo.findById(objectId);
  //       if (!eventUser) {
  //         next(new ResourceNotFoundException('EventUser', objectId));
  //         return;
  //       }
  //       const { event: eventId, user: userIdToTag } = eventUser;
  //       const event = await EventService.findById(eventId);
  //       if (!event) {
  //         next(new ResourceNotFoundException('Event', eventId));
  //         return;
  //       }

  //       if (userIdToTag != userId) {
  //         next(new AccessDeniedException(loggedInUserId, 'Cannot add tag'));
  //         return;
  //       }

  //       const tag = await TagsRepo.findById(tagId);
  //       if (!tag) {
  //         next(new ResourceNotFoundException('Tag', tagId));
  //         return;
  //       }
  //       const userTag = await UserService.addUserTag(
  //         {
  //           taggedBy: loggedInUserId,
  //           user: userId,
  //           tag: tagId,
  //           type: 'event_user',
  //           objectId
  //         },
  //         eventUser
  //       );
  //       res.json({ code: 'SUCCESS', data: userTag });
  //     } else {
  //       next(new InvalidRequestException('User', ['type']));
  //       return;
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // // endorseUser = async (req: Request, res: Response, next: NextFunction) => {
  // //   const { loggedInUser } = res.locals;
  // //   const { userId } = req.params;
  // //   const {
  // //     body: { type, objectId }
  // //   } = req;
  // //   try {
  // //     const { id: loggedInUserId } = loggedInUser;
  // //     if (userId === loggedInUserId) {
  // //       next(new AccessDeniedException(loggedInUserId, 'You are not allowed to endorse yourself'));
  // //       return;
  // //     }
  // //     const eventUser = undefined;
  // //     if (type === 'event_user') {
  // //       const eventUser = await EventUsersRepo.findById(objectId);
  // //       if (!eventUser) {
  // //         next(new ResourceNotFoundException('EventUser', objectId));
  // //         return;
  // //       }
  // //       const { event: eventId, user: userIdToEndorse } = eventUser;
  // //       const event = await EventService.findById(eventId);
  // //       if (!event) {
  // //         next(new ResourceNotFoundException('Event', eventId));
  // //         return;
  // //       }
  // //       const eventUsers = await EventUsersRepo.findByEvent(eventId);
  // //       const loggedInUserInEvent = eventUsers.filter(_ => {
  // //         const {
  // //           user: { _id: userId }
  // //         } = _;
  // //         return userId.toString() === loggedInUserId;
  // //       });
  // //       // console.log(loggedInUserInEvent);
  // //       if (!loggedInUserInEvent || loggedInUserInEvent.length === 0) {
  // //         next(new AccessDeniedException(loggedInUserId, 'You have to join event to be able to endorse others'));
  // //         return;
  // //       }
  // //       if (userIdToEndorse.toString() != userId) {
  // //         next(new AccessDeniedException(loggedInUserId, 'The person you endorse has to join the event first'));
  // //         return;
  // //       }
  // //       const userEndorsement = await UserService.endorseUser(
  // //         {
  // //           endorsedBy: loggedInUserId,
  // //           user: userId,
  // //           type: 'event_user',
  // //           objectId
  // //         },
  // //         eventUser
  // //       );
  // //       res.json({ code: 'SUCCESS', data: userEndorsement });
  // //     } else {
  // //       next(new InvalidRequestException('User', ['type']));
  // //       return;
  // //     }
  // //   } catch (err) {
  // //     next(err);
  // //   }
  // // };

  // // unendorseUser = async (req: Request, res: Response, next: NextFunction) => {
  // //   const { loggedInUser } = res.locals;
  // //   const { userId } = req.params;
  // //   const {
  // //     body: { type, objectId }
  // //   } = req;
  // //   try {
  // //     const { id: loggedInUserId } = loggedInUser;
  // //     if (userId === loggedInUserId) {
  // //       next(new AccessDeniedException(loggedInUserId, 'You are not allowed to unendorse yourself'));
  // //       return;
  // //     }
  // //     const eventUser = undefined;
  // //     if (type === 'event_user') {
  // //       const eventUser = await EventUsersRepo.findById(objectId);
  // //       if (!eventUser) {
  // //         next(new ResourceNotFoundException('EventUser', objectId));
  // //         return;
  // //       }
  // //       const { event: eventId, user: userIdToEndorse } = eventUser;
  // //       const event = await EventService.findById(eventId);
  // //       if (!event) {
  // //         next(new ResourceNotFoundException('Event', eventId));
  // //         return;
  // //       }
  // //       const eventUsers = await EventUsersRepo.findByEvent(eventId);
  // //       const loggedInUserInEvent = eventUsers.filter(_ => {
  // //         const {
  // //           user: { _id: userId }
  // //         } = _;
  // //         return userId.toString() === loggedInUserId;
  // //       });
  // //       // console.log(loggedInUserInEvent);
  // //       if (!loggedInUserInEvent || loggedInUserInEvent.length === 0) {
  // //         next(new AccessDeniedException(loggedInUserId, 'You have to join event to be able to unendorse others'));
  // //         return;
  // //       }
  // //       if (userIdToEndorse.toString() != userId) {
  // //         next(new AccessDeniedException(loggedInUserId, 'The person you unendorse has to join the event first'));
  // //         return;
  // //       }
  // //       const userEndorsement = await UserService.unendorseUser(
  // //         {
  // //           endorsedBy: loggedInUserId,
  // //           user: userId,
  // //           type: 'event_user',
  // //           objectId
  // //         },
  // //         eventUser
  // //       );
  // //       res.json({ code: 'SUCCESS', data: userEndorsement });
  // //     } else {
  // //       next(new InvalidRequestException('User', ['type']));
  // //       return;
  // //     }
  // //   } catch (err) {
  // //     next(err);
  // //   }
  // // };

  // // updateTagsAndEndorsements = async (req: Request, res: Response, next: NextFunction) => {
  // //   try {
  // //     const result = await UserService.updateTagsAndEndorsements();
  // //     res.json({ code: 'SUCCESS', data: result });
  // //   } catch (err) {
  // //     next(err);
  // //   }
  // // };

  // // updateCredits = async (req: Request, res: Response, next: NextFunction) => {
  // //   try {
  // //     const result = await UserService.updateCredits();
  // //     // const updatedResult = result.filter(_ => {
  // //     //   // console.log(_);
  // //     //   return typeof _ !== 'undefined';
  // //     // });
  // //     // console.log(JSON.stringify(result));
  // //     res.json({
  // //       code: 'SUCCESS',
  // //       data: `${result.length} users are updated`
  // //     });
  // //   } catch (err) {
  // //     next(err);
  // //   }
  // // };

  // getMyGames = async (req: Request, res: Response, next: NextFunction) => {
  //   const { loggedInUser } = res.locals;
  //   const { status } = req.query;
  //   try {
  //     const games = await UserService.getUserGames(loggedInUser);
  //     res.json({ code: 'SUCCESS', data: games });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // getMyOnlineScripts = async (req: Request, res: Response, next: NextFunction) => {
  //   const { loggedInUser } = res.locals;
  //   const { dmShop } = loggedInUser;

  //   try {
  //     let scripts = [];
  //     console.log(dmShop);
  //     if (dmShop) {
  //       const { onlineScripts } = dmShop;
  //       scripts = onlineScripts;
  //     }
  //     res.json({ code: 'SUCCESS', data: scripts });
  //   } catch (err) {
  //     next(err);
  //   }
  // };
}
