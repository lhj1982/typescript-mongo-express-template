import { Route, Path, Example, Get, Post, Put, SuccessResponse, Tags, Body, OperationId, Request, Response, Security } from 'tsoa';
import { IUpdateUserRequest, IAddUserTagRequest, ISubscribeMemberRequest, IRedeemMemberCardRequest } from '../requests';
import { IResponse, IErrorResponse } from '../responses';
import GenericController from './generic.controller';

import { InvalidRequestException, ResourceNotFoundException, AccessDeniedException } from '../../exceptions/custom.exceptions';
import EventService from '../svcs/event.service';
import MemberService from '../svcs/member.service';
import TagService from '../svcs/tag.service';
import UserService from '../svcs/user.service';
import CacheService from '../svcs/cache.service';

@Route('/users')
export class UsersController extends GenericController {
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

  // @Get('/access_token/{appName}')
  // @Tags('user')
  // @OperationId('getUserDetailById')
  // @Security('access_token')
  // @Response<IErrorResponse>('400', 'Bad Request')
  // @SuccessResponse('200', 'OK')
  // public async getAccessToken(@Path('appName') appName: string): Promise<IResponse> {
  //   // const { appName } = req.params;
  //   const response = await AuthApi.getAccessToken(appName);
  //   return {code: 'SUCCESS', data: response};
  // };

  /**
   * Retrieve user information.
   *
   * @summary Retrieve user information
   * @param {[type]} '/{userId}' [description]
   */
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
      const events = await EventService.findEventsByUser(user, statusArr);
      // const events = [];
      const response = Object.assign(user, { events });
      return { code: 'SUCCESS', data: response };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update a single user.
   *
   * @summary Update user profile.
   * @param {string} userId user to update
   * @param {object} body user data to update
   */
  @Put('/{userId}')
  @Tags('user')
  @OperationId('updateUser')
  @Security('access_token', ['user:updateUser'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  @Example<IResponse>({
    code: 'SUCCESS',
    data: {
      openId: 'test',
      createdAt: new Date()
    }
  })
  public async updateUser(@Path('userId') userId: string, @Body() body: IUpdateUserRequest, @Request() req: any): Promise<IResponse> {
    try {
      const {
        user: { id: loggedInUserId }
      } = req;
      const user = await UserService.findById(userId);
      if (!user) {
        throw new ResourceNotFoundException('User', userId);
      }
      if (loggedInUserId !== userId) {
        throw new AccessDeniedException(loggedInUserId);
      }
      const { nickName, description, email, wechatId, avatarImage, ageTag, gameLevel } = body;
      const dataToUpdate = {};

      if (typeof nickName !== 'undefined') {
        dataToUpdate['nickName'] = nickName;
      }
      if (typeof description !== 'undefined') {
        dataToUpdate['description'] = description;
      }
      if (email) {
        dataToUpdate['email'] = email;
      }
      if (wechatId) {
        dataToUpdate['wechatId'] = wechatId;
      }
      if (avatarImage) {
        dataToUpdate['avatarImage'] = avatarImage;
      }
      if (typeof gameLevel !== 'undefined') {
        dataToUpdate['gameLevel'] = gameLevel;
      }
      if (ageTag) {
        dataToUpdate['ageTag'] = ageTag;
      }
      const userToUpdate = Object.assign(user, dataToUpdate);
      const updatedUser = await UserService.saveOrUpdate(userToUpdate);
      await CacheService.purgeUserCache([userId]);
      return { code: 'SUCCESS', data: updatedUser };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Block user by given userId. Required permission: user:blockUserById.
   *
   * @summary Block a user
   * @param {[type]} '/{userId}/block' [description]
   */
  @Put('/{userId}/block')
  @Tags('user')
  @OperationId('blockUserById')
  @Security('access_token', ['user:blockUserById'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async blockUser(@Request() req: any, @Path('userId') userId: string): Promise<IResponse> {
    const { user: loggedInUser } = req;
    try {
      if (!loggedInUser) {
        throw new AccessDeniedException('');
      }

      // const { userId } = req.params;
      const user = await UserService.findById(userId);
      if (!user) {
        throw new ResourceNotFoundException('User', userId);
      }
      const userToUpdate = Object.assign(user.toObject(), {
        status: 'blocked'
      });
      const newUser = await UserService.saveOrUpdate(userToUpdate);
      return { code: 'SUCCESS', data: newUser };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Give tag to a given user.
   *
   * @summary Give tag to a given user
   * @param {[type]} '/{userId}/tag' [description]
   */
  @Post('/{userId}/tag')
  @Tags('user')
  @OperationId('tagUser')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async addUserTag(@Request() req: any, @Path('userId') userId: string, @Body() body: IAddUserTagRequest): Promise<IResponse> {
    const { user: loggedInUser } = req;
    // const { userId } = req.params;
    const { tagId, type, objectId } = body;
    try {
      const { id: loggedInUserId } = loggedInUser;
      if (userId === loggedInUserId) {
        throw new AccessDeniedException(loggedInUserId, 'You are not allowed to tag yourself');
      }
      // const eventUser = undefined;
      if (type === 'event_user') {
        const eventUser = await EventService.findEventUserById(objectId);
        if (!eventUser) {
          throw new ResourceNotFoundException('EventUser', objectId);
        }
        const { event, user: userToTag } = eventUser;
        // const event = await EventService.findById(eventId);
        if (!event) {
          throw new ResourceNotFoundException('Event', event.id);
        }
        const { id: userIdToTag } = userToTag;
        if (userIdToTag != userId) {
          throw new AccessDeniedException(loggedInUserId, 'Cannot add tag');
        }
        const tag = await TagService.findById(tagId);
        if (!tag) {
          throw new ResourceNotFoundException('Tag', tagId);
        }
        const userTag = await UserService.addUserTag(
          {
            taggedBy: loggedInUser,
            user: userIdToTag,
            tag,
            type: 'event_user',
            objectId
          },
          eventUser
        );
        return { code: 'SUCCESS', data: userTag };
      } else {
        throw new InvalidRequestException('User', ['type']);
      }
    } catch (err) {
      throw err;
    }
  }

  // endorseUser = async (req: Request, res: Response, next: NextFunction) => {
  //   const { loggedInUser } = res.locals;
  //   const { userId } = req.params;
  //   const {
  //     body: { type, objectId }
  //   } = req;
  //   try {
  //     const { id: loggedInUserId } = loggedInUser;
  //     if (userId === loggedInUserId) {
  //       next(new AccessDeniedException(loggedInUserId, 'You are not allowed to endorse yourself'));
  //       return;
  //     }
  //     const eventUser = undefined;
  //     if (type === 'event_user') {
  //       const eventUser = await EventUsersRepo.findById(objectId);
  //       if (!eventUser) {
  //         next(new ResourceNotFoundException('EventUser', objectId));
  //         return;
  //       }
  //       const { event: eventId, user: userIdToEndorse } = eventUser;
  //       const event = await EventService.findById(eventId);
  //       if (!event) {
  //         next(new ResourceNotFoundException('Event', eventId));
  //         return;
  //       }
  //       const eventUsers = await EventUsersRepo.findByEvent(eventId);
  //       const loggedInUserInEvent = eventUsers.filter(_ => {
  //         const {
  //           user: { _id: userId }
  //         } = _;
  //         return userId.toString() === loggedInUserId;
  //       });
  //       // console.log(loggedInUserInEvent);
  //       if (!loggedInUserInEvent || loggedInUserInEvent.length === 0) {
  //         next(new AccessDeniedException(loggedInUserId, 'You have to join event to be able to endorse others'));
  //         return;
  //       }
  //       if (userIdToEndorse.toString() != userId) {
  //         next(new AccessDeniedException(loggedInUserId, 'The person you endorse has to join the event first'));
  //         return;
  //       }
  //       const userEndorsement = await UserService.endorseUser(
  //         {
  //           endorsedBy: loggedInUserId,
  //           user: userId,
  //           type: 'event_user',
  //           objectId
  //         },
  //         eventUser
  //       );
  //       res.json({ code: 'SUCCESS', data: userEndorsement });
  //     } else {
  //       next(new InvalidRequestException('User', ['type']));
  //       return;
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // unendorseUser = async (req: Request, res: Response, next: NextFunction) => {
  //   const { loggedInUser } = res.locals;
  //   const { userId } = req.params;
  //   const {
  //     body: { type, objectId }
  //   } = req;
  //   try {
  //     const { id: loggedInUserId } = loggedInUser;
  //     if (userId === loggedInUserId) {
  //       next(new AccessDeniedException(loggedInUserId, 'You are not allowed to unendorse yourself'));
  //       return;
  //     }
  //     const eventUser = undefined;
  //     if (type === 'event_user') {
  //       const eventUser = await EventUsersRepo.findById(objectId);
  //       if (!eventUser) {
  //         next(new ResourceNotFoundException('EventUser', objectId));
  //         return;
  //       }
  //       const { event: eventId, user: userIdToEndorse } = eventUser;
  //       const event = await EventService.findById(eventId);
  //       if (!event) {
  //         next(new ResourceNotFoundException('Event', eventId));
  //         return;
  //       }
  //       const eventUsers = await EventUsersRepo.findByEvent(eventId);
  //       const loggedInUserInEvent = eventUsers.filter(_ => {
  //         const {
  //           user: { _id: userId }
  //         } = _;
  //         return userId.toString() === loggedInUserId;
  //       });
  //       // console.log(loggedInUserInEvent);
  //       if (!loggedInUserInEvent || loggedInUserInEvent.length === 0) {
  //         next(new AccessDeniedException(loggedInUserId, 'You have to join event to be able to unendorse others'));
  //         return;
  //       }
  //       if (userIdToEndorse.toString() != userId) {
  //         next(new AccessDeniedException(loggedInUserId, 'The person you unendorse has to join the event first'));
  //         return;
  //       }
  //       const userEndorsement = await UserService.unendorseUser(
  //         {
  //           endorsedBy: loggedInUserId,
  //           user: userId,
  //           type: 'event_user',
  //           objectId
  //         },
  //         eventUser
  //       );
  //       res.json({ code: 'SUCCESS', data: userEndorsement });
  //     } else {
  //       next(new InvalidRequestException('User', ['type']));
  //       return;
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // updateTagsAndEndorsements = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const result = await UserService.updateTagsAndEndorsements();
  //     res.json({ code: 'SUCCESS', data: result });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // updateCredits = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const result = await UserService.updateCredits();
  //     // const updatedResult = result.filter(_ => {
  //     //   // console.log(_);
  //     //   return typeof _ !== 'undefined';
  //     // });
  //     // console.log(JSON.stringify(result));
  //     res.json({
  //       code: 'SUCCESS',
  //       data: `${result.length} users are updated`
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  /**
   * A user can subscribe to become a member.
   *
   * @summary A user can subscribe to become a member.
   * @param {string} userId user to subscribe member
   * @param {object} body subscription request body
   */
  @Post('/{userId}/subscribe-member')
  @Tags('user')
  @OperationId('subscribeMember')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  async subscribeMember(@Request() req: any, @Path('userId') userId: string, @Body() body: ISubscribeMemberRequest): Promise<IResponse> {
    try {
      const { memberCardTypeId } = body;
      const memberCardType = await MemberService.findMemberCardTypeById(memberCardTypeId);
      if (!memberCardType) {
        throw new ResourceNotFoundException('MemberCardType', memberCardTypeId);
      }
      const { user: loggedInUser } = req;
      const result = await MemberService.subscribeNewMember(loggedInUser, memberCardType);
      return { code: 'SUCCESS', data: result };
    } catch (err) {
      throw err;
    }
  }

  /**
   * User can redeem a member card by using a redeem code.
   *
   * @summary redeem member card
   * @param {string} userId user to redeem card
   * @param {object} redeem card request
   */
  @Post('/{userId}/redeem-member-card')
  @Tags('user')
  @OperationId('redeemMemberCard')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  async redeemMemberCard(@Request() req: any, @Path('userId') userId: string, @Body() body: IRedeemMemberCardRequest): Promise<IResponse> {
    try {
      const { user: loggedInUser } = req;
      const { redeemCode } = body;
      const user = await UserService.findById(userId);
      if (loggedInUser.id !== user.id) {
        throw new AccessDeniedException(user.id, `You can only redeem for youself`);
      }
      const memberCard = await MemberService.redeemMemberCard(user, redeemCode);
      return { code: 'SUCCESS', data: memberCard };
    } catch (err) {
      throw err;
    }
  }
}
