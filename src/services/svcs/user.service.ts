// import config from '../../config';
import logger from '../../middleware/logger.middleware';
import { pp } from '../../utils/stringUtil';
// import { nowDate } from '../../utils/dateUtil';
import GenericService from './generic.service';

import { IMemberModel } from '../../data/repositories/member/member.model';
import { IUserModel } from '../../data/repositories/user/user.model';
import { IUserTagModel } from '../../data/repositories/tag/userTag.model';
import { IEventUserModel } from '../../data/repositories/event/eventUser.model';
import { ITagModel } from '../../data/repositories/tag/tag.model';
import LoginSessionsRepo from '../../data/repositories/user/loginSessions.repository';
import MembersRepo from '../../data/repositories/member/members.repository';
// import OrdersRepo from '../../data/repositories/order/orders.repository';
import UsersRepo from '../../data/repositories/user/users.repository';
// import EventUsersRepo from '../repositories/eventUsers.repository';
import UserTagsRepo from '../../data/repositories/tag/userTags.repository';
import WatchListsRepo from '../../data/repositories/user/watchLists.repository';
import GamePlayersRepo from '../../data/repositories/game/gamePlayers.repository';
import { ResourceNotFoundException, WrongCredentialException } from '../../exceptions/custom.exceptions';
import WXBizDataCrypt from '../../utils/WXBizDataCrypt';

class UserService extends GenericService {
  async logSession(session: any): Promise<void> {
    try {
      await LoginSessionsRepo.addNew(session);
    } catch (err) {
      throw err;
    }
  }

  async updateSession(session: any): Promise<void> {
    try {
      await LoginSessionsRepo.updateSession(session);
    } catch (err) {
      throw err;
    }
  }

  async findById(id: string): Promise<any> {
    try {
      const user = await UsersRepo.findById(id);
      if (!user) {
        throw new ResourceNotFoundException('User', id);
      }
      const { employers } = user;
      let dmShops = [];
      if (employers) {
        dmShops = employers
          .filter(_ => {
            const { role } = _;
            return role === 'dungeon-master';
          })
          .map(_ => {
            const { shop } = _;
            return shop;
          });
      }
      const watchList = await WatchListsRepo.find({
        user: user._id,
        type: 'script_interested'
      });
      const watches = watchList.map(_ => {
        const { scriptObj } = _;
        return scriptObj;
      });
      const userObj = user.toObject();
      delete userObj.shopStaffs;
      delete userObj.tokenIssuedAt;
      delete userObj.tokenExpiredAt;
      return { ...userObj, dmShops, watches };
    } catch (err) {
      throw err;
    }
  }

  async findOneByParams(params: any): Promise<any> {
    try {
      const user = await UsersRepo.findOne(params);
      if (user) {
        console.log(user);
        const { shopStaffs } = user;
        let shops = [];
        if (shopStaffs) {
          shops = shopStaffs.map(_ => {
            const { shop } = _;
            return shop;
          });
        }
        const userObj = user.toObject();
        delete userObj.shopStaffs;
        return { ...userObj, shops };
      } else {
        return undefined;
      }
    } catch (err) {
      throw err;
    }
  }

  async findByUserNameAndPassword(username: string, password: string): Promise<any> {
    try {
      const user = await UsersRepo.findByUserNameAndPassword(username, password);
      if (!user) {
        throw new WrongCredentialException(username, password);
      }
      const { shopStaffs } = user;
      const shops = shopStaffs.map(_ => {
        const { shop } = _;
        return shop;
      });
      const userObj = user.toObject();
      delete userObj.shopStaffs;
      return { ...userObj, shops };
    } catch (err) {
      throw err;
    }
  }

  /**
   * 1. check user session key
   * 2. if it's expired, request a new one.
   * 3. use the session key to get encrypted data decrypted
   *
   * @param {[type]} user [description]
   * @param {[type]} data [description]
   */
  async getWechatEncryptedData(appId: string, data: any): Promise<any> {
    logger.info(`${pp(data)}`);
    try {
      const { encryptedData, iv, sessionKey } = data;
      const newWBDC = new WXBizDataCrypt(appId, sessionKey);
      const decryptedData = newWBDC.decryptData(encryptedData, iv);
      return decryptedData;
    } catch (err) {
      throw err;
    }
  }

  async saveOrUpdate(user: any): Promise<IUserModel> {
    return UsersRepo.saveOrUpdateUser(user);
  }

  async addUserTag(
    userTag: {
      taggedBy: IUserModel;
      user: IUserModel;
      tag: ITagModel;
      type: string;
      objectId: string;
    },
    eventUser: IEventUserModel
  ): Promise<IUserTagModel> {
    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };

      const newUserTag = await UserTagsRepo.saveOrUpdate(userTag, opts);
      await session.commitTransaction();
      await this.endSession();

      // update eventUser tags after successfully update user tags
      // const eventUserTags = await this.getEventUserTags(newUserTag);
      // const eventUserToUpdate = Object.assign(eventUser.toObject(), {
      //   tags: eventUserTags
      // });
      // console.log(eventUserToUpdate);
      // await EventUsersRepo.saveOrUpdate(eventUserToUpdate, opts);
      // const { taggedBy, objectId } = userTag;
      // const rewardToAdd = {
      //   user: taggedBy,
      //   objectId,
      //   type: 'user_tagged',
      //   points: 2
      // };
      // await this.saveUserRewardsForEndorsementAndTag(rewardToAdd, opts);
      await session.commitTransaction();
      await this.endSession();
      return newUserTag;
    } catch (err) {
      console.error(err);
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }

  /**
   * Get tags for given event user.
   *
   * return data is like
   *
   * [ { count: 1, tag: 5de6859193c0f4662f4374e7 } ]
   *
   * @param {any} userTag [description]
   */
  async getEventUserTags(userTag: any): Promise<IUserTagModel[]> {
    const { type, user, objectId } = userTag;
    const userTags = await UserTagsRepo.findByUser({ user, type, objectId });
    return userTags;
  }

  async getUserGames(user: IUserModel, status: string[] = ['ready', 'completed']): Promise<any> {
    const gamePlayers = await GamePlayersRepo.findByUser(user, status);
    // console.log(gamePlayers);
    // filter away game == null
    const games = gamePlayers
      .filter(_ => {
        const { game } = _;
        return game;
      })
      .map(_ => {
        const { game } = _;
        return game;
      });
    return games;
  }

  async getUserMember(user: IUserModel): Promise<IMemberModel> {
    return await MembersRepo.findByUser(user);
  }
}

export default new UserService();
