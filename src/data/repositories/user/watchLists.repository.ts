import { Model, model } from 'mongoose';
import { IWatchListModel } from './watchList.model';

import { WatchListSchema } from './watchList.schema';
const WatchList: Model<IWatchListModel> = model<IWatchListModel>('WatchList', WatchListSchema);
// mongoose.set('useFindAndModify', false);

class WatchListsRepo {
  async find(params: any): Promise<any> {
    const { user, type, objectId } = params;
    const match = {
      type
    };
    if (user) {
      match['user'] = user;
    }
    if (objectId) {
      match['objectId'] = objectId;
    }
    return await WatchList.aggregate([
      {
        $match: match
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
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userObj'
        }
      },
      {
        $unwind: {
          path: '$userObj'
        }
      },

      {
        $lookup: {
          from: 'scripts',
          localField: 'convertedObjectId',
          foreignField: '_id',
          as: 'scriptObj'
        }
      },
      {
        $unwind: {
          path: '$scriptObj'
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $project: {
          convertedObjectId: 0,
          user: 0
        }
      }
    ])
      // .populate('user', ['-password'])
      // .populate('script')
      .exec();
  }

  async getMostWatchedScripts(limit = 5): Promise<IWatchListModel[]> {
    return await WatchList.aggregate([
      {
        $match: { type: 'script_interested' }
      },
      {
        $group: {
          _id: '$objectId',
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          convertedObjectId: {
            $toObjectId: '$_id'
          }
        }
      },
      {
        $lookup: {
          from: 'scripts',
          localField: 'convertedObjectId',
          foreignField: '_id',
          as: 'scriptObj'
        }
      },
      {
        $unwind: {
          path: '$scriptObj'
        }
      },
      {
        $project: { _id: 0, convertedObjectId: 0 }
      },
      {
        $sort: {
          count: -1
        }
      },
      {
        $limit: limit
      }
    ]);
  }

  async delete(watchList: any, opts = {}): Promise<IWatchListModel> {
    const options = {
      ...opts
    };
    const { user, type, objectId } = watchList;
    return await WatchList.findOneAndRemove({ user, type, objectId }, options).exec();
  }

  async saveOrUpdate(watchList: any, opts: object = {}): Promise<IWatchListModel> {
    const options = {
      ...opts,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { user, type, objectId } = watchList;
    return await WatchList.findOneAndUpdate({ user, type, objectId }, watchList, options).exec();
  }
}

export default new WatchListsRepo();
