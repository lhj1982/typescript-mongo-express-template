import { Model, model } from 'mongoose';
import { IUserModel } from './user.model';
import { UserSchema } from './user.schema';

export const User: Model<IUserModel> = model<IUserModel>('User', UserSchema);

import * as bcrypt from 'bcrypt';
import { nowDate } from '../../../utils/dateUtil';

class UsersRepo {
  async batchUpdateCredits(users): Promise<any> {
    return new Promise((resolve, reject) => {
      const bulk = User.collection.initializeUnorderedBulkOp();
      for (let i = 0; i < users.length; i++) {
        const { userId } = users[i];
        let { gain, spend } = users[i];
        if (!gain) {
          gain = 0;
        }
        if (!spend) {
          spend = 0;
        }
        bulk.find({ _id: userId }).update({ $set: { credits: gain - spend } });
      }
      bulk.execute((err, bulkres) => {
        if (err) {
          return reject(err);
        } else {
          // console.log(bulkres);
          resolve(bulkres);
        }
      });
    });
  }

  async findById(id: string): Promise<IUserModel> {
    // console.log('script ' + mongoose.Types.ObjectId.isValid(id));
    return await User.findById(id)
      .populate('roles', ['name', 'permissions'])
      .populate({
        path: 'coupons',
        match: {
          status: { $in: ['created', 'ready'] },
          expiredAt: { $gt: nowDate() }
        }
      })
      .populate({
        path: 'employers',
        model: 'ShopStaff',
        populate: {
          path: 'shop'
        }
      })
      .populate({
        path: 'members',
        populate: {
          path: 'level'
        }
      })
      .select('-password')
      .exec();
  }

  // getAllCourses(options) {
  //   return User.findAll(options);
  // }

  // async find(params) {
  //   return await User.find(params).exec();
  // }

  async findOne(params: any): Promise<IUserModel> {
    return await User.where(params)
      .findOne()
      .populate('roles', ['name'])
      .populate({
        path: 'shopStaffs',
        model: 'ShopStaff',
        populate: {
          path: 'shop'
        }
      })
      .populate({
        path: 'employers',
        model: 'ShopStaff',
        populate: {
          path: 'shop'
        }
      })
      .populate({
        path: 'members',
        populate: {
          path: 'level'
        }
      })
      .select('-password')
      .exec();
  }

  async findByUserNameAndPassword(username: string, password: string): Promise<IUserModel> {
    const user = await User.findOne({ username })
      .populate('roles', ['name', 'permissions'])
      .populate({
        path: 'shopStaffs',
        model: 'ShopStaff',
        populate: {
          path: 'shop'
        }
      })
      .exec();
    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        return user;
      }
    }
    return null;
  }

  // async getMostCommissionEntry() {
  //   const commissions = await EventCommission.aggregate([
  //     {
  //       $lookup: {
  //         from: 'events',
  //         localField: 'event',
  //         foreignField: '_id',
  //         as: 'eventObj'
  //       }
  //     },
  //     {
  //       $unwind: {
  //         path: '$eventObj'
  //       }
  //     },
  //     {
  //       $match: {
  //         'eventObj.status': 'completed'
  //       }
  //     },
  //     {
  //       $sort: {
  //         'commissions.host.amount': -1
  //       }
  //     },
  //     {
  //       $limit: 1
  //     },
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'commissions.host.user',
  //         foreignField: '_id',
  //         as: 'hostUser'
  //       }
  //     },
  //     {
  //       $unwind: {
  //         path: '$hostUser',
  //         preserveNullAndEmptyArrays: true
  //       }
  //     }
  //   ]).exec();
  //   const commission = undefined;
  //   if (commissions.length > 0) {
  //     return commissions[0];
  //   }
  //   return commission;
  // }

  // async getMostCommissionAllEventEntry() {
  //   const commissions = await EventCommission.aggregate([
  //     {
  //       $lookup: {
  //         from: 'events',
  //         localField: 'event',
  //         foreignField: '_id',
  //         as: 'eventObj'
  //       }
  //     },
  //     {
  //       $unwind: {
  //         path: '$eventObj'
  //       }
  //     },
  //     {
  //       $match: {
  //         'eventObj.status': 'completed'
  //       }
  //     },
  //     {
  //       $group: {
  //         _id: '$commissions.host.user',
  //         totalHostAmount: {
  //           $sum: '$commissions.host.amount'
  //         }
  //       }
  //     },
  //     {
  //       $addFields: { user: '$_id' }
  //     },
  //     {
  //       $sort: {
  //         totalHostAmount: -1
  //       }
  //     },
  //     {
  //       $project: { _id: 0 }
  //     },
  //     {
  //       $limit: 1
  //     }
  //   ]).exec();
  //   const commission = undefined;
  //   if (commissions.length > 0) {
  //     return commissions[0];
  //   }
  //   return commission;
  // }

  // async saveAccessToken(user) {
  //   await User.save(user).exec();
  // }

  async saveOrUpdateUser(user: any, opts: object = {}): Promise<IUserModel> {
    const options = {
      ...opts,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { openId, unionId } = user;
    if (unionId) {
      return await User.findOneAndUpdate({ unionId }, user, options).exec();
    } else if (openId) {
      return await User.findOneAndUpdate({ openId }, user, options).exec();
    } else {
      throw new Error(`Neither openId nor unionId is found`);
    }
  }

  // async getUserEvents(userId: string) {
  //   return await EventUsersRepo.findByUser(userId);
  // }
}
export default new UsersRepo();
