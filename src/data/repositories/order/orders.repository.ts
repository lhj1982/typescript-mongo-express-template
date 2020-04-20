import { model } from 'mongoose';
import { escapeRegex } from '../../../utils/stringUtil';
import { IUserModel } from '../user/user.model';
import { IOrderModel } from './order.model';
import { OrderSchema } from './order.schema';
import { string2Date } from '../../../utils/dateUtil';
const Order = model<IOrderModel>('Order', OrderSchema, 'orders');
// mongoose.set('useFindAndModify', false);

class OrdersRepo {
  async find(params): Promise<any> {
    const { offset, limit, outTradeNo, type, objectId, createdBy } = params;
    // let condition = { outTradeNo };
    let condition = {};
    if (outTradeNo) {
      const regex = new RegExp(escapeRegex(outTradeNo), 'gi');
      condition = { outTradeNo: regex };
    }
    if (type) {
      condition['type'] = type;
    }
    if (objectId) {
      condition['objectId'] = objectId;
    }
    if (createdBy) {
      condition['createdBy'] = createdBy;
    }

    const total = await Order.find(condition)
      .countDocuments({})
      .exec();
    const pagination = { offset, limit, total };
    const pagedOrders = await Order.find(condition)
      .populate({
        path: 'refunds',
        populate: {
          path: 'user',
          select: '-sessionKey -password -roles'
        }
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
    return { pagination, data: pagedOrders };
  }

  async findById(id: string): Promise<IOrderModel> {
    // console.log('script ' + mongoose.Types.ObjectId.isValid(id));
    return await Order.findById(id)
      .populate('createdBy', ['_id', 'openId', 'nickName', 'avatarUrl', 'gender', 'country', 'province', 'city', 'language', 'mobile', 'wechatId', 'ageTag'])
      .populate('refunds')
      .exec();
  }

  // async findUnique(params) {
  //   return await Order.findOne(params).exec();
  // }
  async findByParams(params): Promise<IOrderModel> {
    return await Order.findOne(params).exec();
  }

  async findByTradeNo(outTradeNo: string): Promise<IOrderModel> {
    return await Order.findOne({ outTradeNo })
      .populate('createdBy', ['_id', 'openId', 'nickName', 'avatarUrl', 'gender', 'country', 'province', 'city', 'language', 'mobile', 'wechatId', 'ageTag'])
      .populate('refunds')
      .exec();
  }

  async getRefundableOrders(filter, opts = {}): Promise<IOrderModel[]> {
    const { orderStatus } = filter;
    return await Order.find({ orderStatus }, opts).exec();
  }

  /**
   * Used for admin report system.
   *
   * @param {any = {}} params [description]
   */
  async getOrders(params: any = {}): Promise<any> {
    const { shopName, fromDate, toDate, statuses, limit, offset } = params;
    const aggregate: any[] = [
      {
        $match: {
          createdAt: {
            $gte: string2Date(fromDate).toDate(),
            $lt: string2Date(toDate).toDate()
          }
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
          from: 'refunds',
          localField: '_id',
          foreignField: 'order',
          as: 'refunds'
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
        $match: {
          'booking.eventObj.status': { $in: statuses }
        }
      },
      {
        $lookup: {
          from: 'shops',
          localField: 'booking.eventObj.shop',
          foreignField: '_id',
          as: 'booking.eventObj.shopObj'
        }
      },
      {
        $unwind: {
          path: '$booking.eventObj.shopObj',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'eventCommissions',
          localField: 'booking.eventObj._id',
          foreignField: 'event',
          as: 'booking.eventObj.commissions'
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: {
          _id: 0,
          convertedObjectId: 0,
          'booking.eventObj.shop': 0,
          'booking.event': 0
        }
      }
    ];
    if (shopName) {
      const regex = new RegExp(escapeRegex(shopName), 'gi');
      const shopMatch = { $match: { 'booking.eventObj.shopObj.name': regex } };
      // const match['booking.eventObj.shopObj.name'] = {$regex: ''};
      aggregate.push(shopMatch);
    }

    // console.log(aggregate);
    const result = await Order.aggregate([...aggregate, { $count: 'total' }]).exec();
    let total = 0;
    if (result.length > 0) {
      total = result[0];
    }
    // console.log(total);
    const data = await Order.aggregate([...aggregate, { $skip: offset }, { $limit: limit }]).exec();
    // console.log(data);
    const pagination = { offset, limit, total };
    return { pagination, data };
  }

  async getLastRefundableOrder(user: IUserModel): Promise<IOrderModel[]> {
    return await Order.aggregate([
      {
        $match: {
          createdBy: user._id,
          type: 'event_join'
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
          as: 'booking.event'
        }
      },
      {
        $unwind: {
          path: '$booking.event',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'scripts',
          localField: 'booking.event.script',
          foreignField: '_id',
          as: 'booking.event.script'
        }
      },
      {
        $unwind: {
          path: '$booking.event.script',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'refunds',
          localField: 'outTradeNo',
          foreignField: 'outTradeNo',
          as: 'refunds'
        }
      },
      {
        $match: {
          refunds: { $size: 0 }
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $limit: 1
      },
      {
        $project: {
          _id: 0,
          convertedObjectId: 0,
          'booking.eventObj.shop': 0
          // 'booking.event': 0,
          // 'booking.event': '$booking.eventObj'
        }
      }
      // {
      //   $project: {
      //     _id: 1,
      //     type: 1,
      //     objectId: 1,
      //     createdBy: 1,
      //     amount: 1,
      //     outTradeNo: 1,
      //     orderStatus: 1,
      //     message: 1,
      //     createdAt: 1,
      //     payment: 1,
      //     'booking.event.script': '$booking.eventObj.scriptObj'
      //   }
      // }
    ]).exec();
  }

  async createOrder(order, opts = {}): Promise<IOrderModel> {
    const options = {
      ...opts,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { outTradeNo } = order;
    return await Order.findOneAndUpdate({ outTradeNo }, order, options).exec();
  }

  async saveOrUpdate(order, opts = {}): Promise<IOrderModel> {
    const options = {
      ...opts,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { outTradeNo } = order;
    return await Order.findOneAndUpdate({ outTradeNo }, order, options).exec();
  }

  async updateStatus(criteria, orderStatus, opts = {}): Promise<any> {
    const options = {
      ...opts,
      upsert: false,
      returnNewDocument: true,
      multi: true
    };
    return await Order.updateMany(criteria, { $set: orderStatus }, options);
  }

  async updatePaymentByTradeNo(order, opts = {}): Promise<IOrderModel> {
    const options = {
      ...opts,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { _id, outTradeNo } = order;
    if (_id) {
      return await Order.findOneAndUpdate({ _id }, order, options).exec();
    } else {
      return await Order.findOneAndUpdate({ outTradeNo }, order, options).exec();
    }
  }
}
export default new OrdersRepo();
