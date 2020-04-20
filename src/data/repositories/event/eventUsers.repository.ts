import * as mongoose from 'mongoose';
// import { model } from 'mongoose';
import { IEventModel } from './event.model';
import { IEventUserModel } from './eventUser.model';
import { IUserModel } from '../user/user.model';
import { EventUserSchema } from './eventUser.schema';
const EventUser = mongoose.model<IEventUserModel>('EventUser', EventUserSchema, 'eventUsers');

// mongoose.set('useFindAndModify', false);

class EventUsersRepo {
  async findById(id: string): Promise<IEventUserModel> {
    // console.log('script ' + mongoose.Types.ObjectId.isValid(id));
    return await EventUser.findById(id)
      .populate('event', ['_id', 'name'])
      .populate('user', ['_id'])
      .exec();
  }

  async findByEvent(event: IEventModel, filter = { status: ['unpaid', 'paid'] }): Promise<IEventUserModel[]> {
    const { status } = filter;
    return await EventUser.find({
      event,
      status: { $in: status }
    })
      .populate('event', ['_id', 'name'])
      .populate('user', ['_id'])
      .populate('invitor', ['_id'])
      .exec();
  }

  async findByScript(scriptId: string, filter = { status: ['completed'] }): Promise<IEventUserModel[]> {
    const { status } = filter;
    const eventUsers = await EventUser.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventObj'
        }
      },
      {
        $unwind: { path: '$eventObj' }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userObj'
        }
      },
      {
        $unwind: { path: '$userObj' }
      },
      {
        $match: {
          'eventObj.status': { $in: status },
          'eventObj.script': mongoose.Types.ObjectId(scriptId)
        }
      },
      {
        $group: {
          _id: '$userObj._id',
          user: { $addToSet: '$userObj' }
        }
      },
      {
        $unwind: {
          path: '$user'
        }
      },
      {
        $sort: { 'eventObj.startTime': -1 }
      },
      {
        $project: {
          _id: 0,
          user: 1
        }
      }
    ]).exec();

    return eventUsers;
  }

  async findEventUser(event: IEventModel, user: IUserModel, userName?: string): Promise<IEventUserModel> {
    // console.log(eventId);
    // console.log(userName);
    return await EventUser.find({ event, user })
      .populate('event', ['_id', 'name'])
      .populate('user', ['_id'])
      .findOne()
      .exec();
  }

  // async findByUser(userId: string) {
  //   return await EventUser.find({
  //     user: userId,
  //     status: { $in: ['unpaid', 'paid'] }
  //   })
  //     .populate({
  //       path: 'event',
  //       populate: { path: 'script', select: 'key name' }
  //     })
  //     .populate({
  //       path: 'event',
  //       populate: { path: 'shop', select: 'key name' }
  //     })
  //     .populate('user', ['nickName', 'avatarUrl', 'gender', 'country', 'province', 'city', 'language'])
  //     .exec();
  // }

  async saveOrUpdate(eventUser, opt: object = {}): Promise<IEventUserModel> {
    const options = {
      ...opt,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { event, user, userName, source, createdAt, status, mobile, wechatId, statusNote, endorsements, tags, invitor, invitationCode } = eventUser;
    const e = await this.findEventUser(event, user, userName);
    // console.log(e);
    if (!e) {
      const obj = new EventUser({
        event,
        user,
        userName,
        source,
        status,
        mobile,
        wechatId,
        createdAt,
        endorsements,
        tags,
        invitor,
        invitationCode
      });
      return await obj.save();
    } else {
      return await EventUser.findOneAndUpdate(
        { _id: e._id },
        {
          event,
          user,
          userName,
          source,
          createdAt,
          status,
          mobile,
          wechatId,
          statusNote,
          endorsements,
          tags,
          invitor,
          invitationCode
        },
        options
      ).exec();
    }
  }

  async update(eventUser, opt = {}): Promise<IEventUserModel> {
    const options = {
      ...opt,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { _id } = eventUser;
    return await EventUser.findOneAndUpdate({ _id }, eventUser, options).exec();
  }
}
export default new EventUsersRepo();
