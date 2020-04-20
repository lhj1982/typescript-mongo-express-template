import { model } from 'mongoose';
import { IUserModel } from '../user/user.model';
import { IUserCouponModel } from './userCoupon.model';
import { UserCouponSchema } from './userCoupon.schema';

const UserCoupon = model<IUserCouponModel>('UserCoupon', UserCouponSchema, 'userCoupons');
// mongoose.set('useFindAndModify', false);

class UserCouponsRepo {
  async findById(id: string): Promise<IUserCouponModel> {
    return await UserCoupon.findById(id)
      .populate('owner')
      .exec();
  }

  async findByUser(user: IUserModel, status: string[] = ['active']): Promise<IUserCouponModel[]> {
    // console.log(user.id);
    // return await UserCoupon.find({ owner: user }).exec();
    return await UserCoupon.aggregate([
      {
        $match: {
          owner: user._id,
          status: { $in: status }
        }
      },
      {
        $addFields: {
          convertedObjectId: {
            $toObjectId: '$objectId'
          }
        }
      },
      {
        $lookup: {
          from: 'eventUsers',
          localField: 'convertedObjectId',
          foreignField: '_id',
          as: 'booking'
        }
      },
      {
        $unwind: {
          path: '$booking',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'booking.event',
          foreignField: '_id',
          as: 'booking.eventObj'
        }
      },
      {
        $unwind: {
          path: '$booking.eventObj',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'scripts',
          localField: 'booking.eventObj.script',
          foreignField: '_id',
          as: 'booking.eventObj.scriptObj'
        }
      },
      {
        $unwind: {
          path: '$booking.eventObj.scriptObj',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: {
          _id: 1,
          id: 1,
          type: 1,
          amount: 1,
          description: 1,
          status: 1,
          createdAt: 1,
          expiredAt: 1,
          redeemedAt: 1,
          'booking.event.script': '$booking.eventObj.scriptObj'
        }
      },
      {
        $project: {
          // _id: 0,
          convertedObjectId: 0
          // 'booking.eventObj.shop': 0,
          // 'booking.event': 0
        }
      }
    ]).exec();
  }

  async saveOrUpdate(userCoupon, opts: object = {}): Promise<IUserCouponModel> {
    const options = {
      ...opts,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { _id, owner, type, objectId, status } = userCoupon;
    if (_id) {
      return await UserCoupon.findOneAndUpdate({ _id }, userCoupon, options).exec();
    } else {
      return await UserCoupon.findOneAndUpdate({ owner, type, objectId, status }, userCoupon, options).exec();
    }
  }
}

export default new UserCouponsRepo();
