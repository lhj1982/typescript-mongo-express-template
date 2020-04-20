// import { Request, Response as HttpResponse, NextFunction } from 'express';
import { Route, Get, Controller, Post, BodyProp, Put, Delete, SuccessResponse, Tags, Body, OperationId, Response, Security } from 'tsoa';
import AuthApi from '../api/auth';
// import GenericController from './generic.controller';
// import UsersRepo from '../repositories/users.repository';
// import RolesRepo from '../repositories/roles.repository';
// import UserService from '../services/user.service';
// import CacheService from '../services/cache.service';
import { InvalidRequestException, WrongCredentialException, ResourceNotFoundException, GenericServerErrorException } from '../../exceptions/custom.exceptions';
import * as moment from 'moment';
import * as jwt from 'jsonwebtoken';
import config from '../../config';
import logger from '../../middleware/logger.middleware';
import { IOauthLoginRequest, ICode2SessionRequest, IUpdatePhoneNumberRequest } from '../requests';
import { IResponse, IErrorResponse } from '../responses';
import UserService from '../svcs/user.service';
import RoleService from '../svcs/role.service';
import CacheService from '../svcs/cache.service';

@Route('/oauth')
export class AuthController extends Controller {
  @Post('/login')
  @Tags('auth')
  @OperationId('socialLogin')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async login(@Body() body: IOauthLoginRequest): Promise<IResponse> {
    // prettier-ignore
    const { code, appName, type, nickName, avatarUrl, gender, country, province, city, language, description, encryptedData, iv } = body;
    try {
      if (type === 'wxapp') {
        if (!appName) {
          throw new InvalidRequestException('Auth', ['appName']);
        }
        if (!avatarUrl) {
          throw new InvalidRequestException('Auth', ['avatarUrl']);
        }
        if (!gender || ['male', 'female'].indexOf(gender) == -1) {
          throw new InvalidRequestException('Auth', ['gender']);
        }

        const response = await AuthApi.code2Session(appName, code);
        // prettier-ignore
        // const response = { code: 'SUCCESS', openId: '1234', sessionKey: 'test1', unionId: undefined, errorCode: undefined, errorMsg: undefined };
        const { code: statusCode, openId, sessionKey, errorCode, errorMsg } = response;
        // console.log(response);
        if (statusCode === 'SUCCESS') {
          await UserService.logSession({
            appId: config['appName'][appName]['appId'],
            code,
            sessionKey,
            openId,
            statusCode
          });
          let unionId = undefined;
          // encryptedData to unionId only in production
          if (process.env.NODE_ENV === 'production') {
            // prettier-ignore
            const decryptedUserData = await UserService.getWechatEncryptedData(config['appName'][appName]['appId'], {
            iv,
            encryptedData,
            sessionKey
          });
            const { unionId: u, openId: decryptedOpenId } = decryptedUserData;
            unionId = u;
            if (!unionId) {
              logger.error(`User ${openId} does not have unionId`);
              throw new GenericServerErrorException(`Cannot login`);
            }
            await UserService.updateSession({
              appId: config['appName'][appName]['appId'],
              code,
              sessionKey,
              openId,
              unionId
            });
          } else {
            unionId = 'o0Y3D0qDUTkiL3Z70dqLercAfv4M';
          }
          // console.log(unionId);
          // console.log(decryptedOpenId);
          const role = await RoleService.findByName('user');
          const roles = [role._id];
          const role1 = await RoleService.findByName('admin');
          if (unionId === 'o0Y3D0qDUTkiL3Z70dqLercAfv4M') {
            roles.push(role1._id);
          }
          const userToUpdate = {
            openId,
            unionId,
            sessionKey,
            nickName,
            description,
            avatarUrl,
            gender,
            country,
            province,
            city,
            language,
            status: 'active',
            roles
          };
          // update user info only if there is no data from wechat.
          const user = await UserService.findOneByParams({ unionId });
          if (user) {
            if (user.nickName) {
              userToUpdate.nickName = user.nickName;
            }
            if (user.description) {
              userToUpdate.description = user.description;
            }
            if (user.avatarUrl) {
              userToUpdate.avatarUrl = user.avatarUrl;
            }
            if (user.gender) {
              userToUpdate.gender = user.gender;
            }
            if (user.country) {
              userToUpdate.country = user.country;
            }
            if (user.province) {
              userToUpdate.province = user.province;
            }
            if (user.city) {
              userToUpdate.city = user.city;
            }
            if (user.language) {
              userToUpdate.language = user.language;
            }
            if (user.roles) {
              userToUpdate.roles = user.roles;
            }
          }
          await UserService.saveOrUpdate(userToUpdate);
          const newUser = await UserService.findOneByParams({ unionId });
          // create a token string
          // console.log(this.getTokenPayload);
          // console.log(user._id);
          const token = jwt.sign(this.getTokenPayload(newUser), config.jwt.secret);
          // console.log(token);
          const { id: userId } = newUser;
          await CacheService.purgeUserCache([userId]);
          return {
            code: 'SUCCESS',
            data: { openId, token, newUser }
          };
        } else {
          await UserService.logSession({
            appId: config['appName'][appName]['appId'],
            code,
            sessionKey,
            openId,
            statusCode,
            errorMsg: `Cannot get sessionKey, errorCode: ${errorCode}`
          });
          throw new Error(`Cannot get sessionKey, errorCode: ${errorCode}`);
        }
      } else {
        throw new Error(`Unknown login type, ${type}`);
      }
      // const contact = await UsersRepo.find({});
    } catch (err) {
      throw err;
      // next(err);
    }
  }

  // loginWithUserNameAndPassword = async (req: Request, res: Response, next: NextFunction) => {
  //   const { username, password } = req.body;
  //   if (!username) {
  //     next(new InvalidRequestException('Auth', ['username']));
  //     return;
  //   }
  //   if (!password) {
  //     next(new InvalidRequestException('Auth', ['password']));
  //     return;
  //   }
  //   try {
  //     const user = await UserService.findByUserNameAndPassword(username, password);
  //     // console.log(user);
  //     const token = jwt.sign(this.getTokenPayload(user), config.jwt.secret);
  //     res.json({ token, user });
  //   } catch (err) {
  //     res.send(err);
  //   }
  // };

  @Post('/phonenumber')
  @Tags('auth')
  @OperationId('updatePhoneNumber')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async updatePhoneNumber(@Body() body: IUpdatePhoneNumberRequest): Promise<IResponse> {
    const { appName, openId, iv, encryptedData } = body;
    try {
      if (!appName) {
        throw new InvalidRequestException('Auth', ['appName']);
      }
      // console.log(body);
      const user = await UserService.findOneByParams({ openId });
      if (!user) {
        throw new ResourceNotFoundException('User', openId);
      }
      const { sessionKey } = user;
      const result = await UserService.getWechatEncryptedData(config['appName'][appName]['appId'], {
        iv,
        encryptedData,
        sessionKey
      });
      const { phoneNumber } = result;
      const userToUpdate = Object.assign(user, {
        mobile: phoneNumber
      });
      const newUser = await UserService.saveOrUpdate(userToUpdate);
      return { code: 'SUCCESS', data: newUser };
    } catch (err) {
      throw err;
    }
  }

  @Post('/code2session')
  @Tags('auth')
  @OperationId('authorizeCode2Session')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async code2session(@Body() body: ICode2SessionRequest): Promise<IResponse> {
    const { appName, code } = body;
    try {
      if (!appName) {
        throw new InvalidRequestException('Auth', ['appName']);
      }
      const response = await AuthApi.code2Session(appName, code);
      return { code: 'SUCCESS', data: response };
    } catch (err) {
      throw err;
    }
  }

  getTokenPayload = (user: any): any => {
    // const now = Math.floor(new Date().getTime()/1000);
    const expiredAt = Math.floor(
      moment
        .utc()
        .add(config.jwt.duration, 's')
        .toDate()
        .getTime() / 1000
    );
    const { openId, unionId } = user;
    const data = {
      type: 'wxapp',
      openId: openId,
      unionId: unionId
    };
    // console.log(expiredAt);
    return {
      iss: config.jwt.issuer,
      sub: user._id,
      exp: expiredAt,
      data: JSON.stringify(data)
    };
  };
}
