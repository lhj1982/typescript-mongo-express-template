import config from '../config';
import logger from '../utils/logger';
import { pp } from '../utils/stringUtil';
import { nowDate, addDays2, date2String } from '../utils/dateUtil';
import UsersRepo from '../repositories/users.repository';
import { ResourceNotFoundException, WrongCredentialException } from '../exceptions/custom.exceptions';
const WXBizDataCrypt = require('../utils/WXBizDataCrypt');

class UserService {
  async findById(id: string) {
    try {
      const user = await UsersRepo.findById(id);
      if (!user) {
        throw new ResourceNotFoundException('User', id);
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

  async findOneByParams(params) {
    try {
      const user = await UsersRepo.findOne(params);
      if (user) {
        const { shopStaffs } = user;
        const shops = shopStaffs.map(_ => {
          const { shop } = _;
          return shop;
        });
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

  async findByUserNameAndPassword(username: string, password: string) {
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
  async getWechatEncryptedData(data) {
    logger.info(`${pp(data)}`);
    // const session = await UsersRepo.getSession();
    // session.startTransaction();
    try {
      // const opts = { session };
      const { encryptedData, iv, sessionKey } = data;
      const { appId } = config;
      const newWBDC = new WXBizDataCrypt(appId, sessionKey);

      const resultPhone = newWBDC.decryptData(encryptedData, iv);
      const result = {
        phoneNumber: resultPhone.phoneNumber,
        countryCode: resultPhone.countryCode
      };
      // await session.commitTransaction();
      // await UsersRepo.endSession();
      return result;
    } catch (err) {
      // await session.abortTransaction();
      // await UsersRepo.endSession();
    }
  }
}

export default new UserService();
