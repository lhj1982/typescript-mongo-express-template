import config from '../../config';
import logger from '../../middleware/logger';
import { pp } from '../../utils/stringUtil';
import { nowDate } from '../../utils/dateUtil';
import { IUserModel } from '../../data/repositories/user/user.model';
// import LoginSessionsRepo from '../repositories/loginSessions.repository';
import UsersRepo from '../../data/repositories/user/users.repository';
// import EventUsersRepo from '../repositories/eventUsers.repository';
// import UserTagsRepo from '../repositories/userTags.repository';
import WatchListsRepo from '../../data/repositories/user/watchLists.repository';
// import GamePlayersRepo from '../repositories/gamePlayers.repository';
import { ResourceNotFoundException, WrongCredentialException } from '../../exceptions/custom.exceptions';
import WXBizDataCrypt from '../../utils/WXBizDataCrypt';

class UserService {
  async logSession(session: any): Promise<void> {
    // try {
    //   await LoginSessionsRepo.addNew(session);
    // } catch (err) {
    //   throw err;
    // }
  }

  async updateSession(session: any): Promise<void> {
    // try {
    //   await LoginSessionsRepo.updateSession(session);
    // } catch (err) {
    //   throw err;
    // }
  }

  async findById(id: string): Promise<any> {
    try {
      const user = await UsersRepo.findById(id);
      if (!user) {
        throw new ResourceNotFoundException('User', id);
      }
      const { shopStaffs } = user;
      let shops = [];
      if (shopStaffs) {
        shops = shopStaffs.map(_ => {
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
      return { ...userObj, shops, watches };
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

  // async findByUserNameAndPassword(username: string, password: string): Promise<any> {
  //   try {
  //     const user = await UsersRepo.findByUserNameAndPassword(username, password);
  //     if (!user) {
  //       throw new WrongCredentialException(username, password);
  //     }
  //     const { shopStaffs } = user;
  //     const shops = shopStaffs.map(_ => {
  //       const { shop } = _;
  //       return shop;
  //     });
  //     const userObj = user.toObject();
  //     delete userObj.shopStaffs;
  //     return { ...userObj, shops };
  //   } catch (err) {
  //     throw err;
  //   }
  // }

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
}

export default new UserService();
