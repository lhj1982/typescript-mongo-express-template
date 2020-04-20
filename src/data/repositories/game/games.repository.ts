import { model } from 'mongoose';
import { IGameModel } from './game.model';
import { GameSchema } from './game.schema';
// import * as moment from 'moment';
const Game = model<IGameModel>('Game', GameSchema, 'games');

class GamesRepo {
  async find(params, filter = { status: ['ready'], availableSpots: -1 }, sort = undefined): Promise<any> {
    const { status, availableSpots } = filter;
    const { offset, limit, keyword, scriptId, shopId } = params;
    const condition = {
      status: { $in: status }
    };
    if (scriptId) {
      condition['script'] = scriptId;
    }
    if (shopId) {
      condition['shop'] = shopId;
    }
    let sortObj = { startTime: 1 };
    if (sort) {
      sortObj = Object.assign({}, sort);
    }
    let pagination = undefined;
    let pagedGames = [];
    let games = await Game.find(condition)
      .populate('players')
      .populate({
        path: 'script'
      })
      .populate('shop')
      .populate('hostUser')
      .sort(sortObj)
      .exec();
    games = games.filter(event => {
      const { script, shop } = event;
      return script != null && shop != null;
    });
    pagination = { offset, limit, total: games.length };
    pagedGames = games.slice(offset, offset + limit);
    return { pagination, data: pagedGames };
  }

  // async findByUser(userId: string) {
  //   return await Game.find({ hostUser: userId })
  //     .populate('players')
  //     .populate({
  //       path: 'script'
  //     })
  //     .populate('shop')
  //     .populate('hostUser')
  //     .sort({ createdAt: -1 })
  //     .exec();
  // }

  async findById(id: string, extras = []): Promise<IGameModel> {
    if (extras.indexOf('rundowns') != -1) {
      return await Game.findById(id)
        .populate('players')
        .populate({
          path: 'script',
          populate: {
            path: 'rundowns'
          }
        })
        .populate('shop')
        .populate('hostUser')
        .exec();
    } else {
      return await Game.findById(id)
        .populate('players')
        .populate({
          path: 'script'
        })
        .populate('shop')
        .populate('hostUser')
        .exec();
    }
  }

  async findByParams(params: any): Promise<IGameModel[]> {
    return await Game.find(params)
      .populate('players')
      .populate({
        path: 'script',
        populate: [
          {
            path: 'rundowns',
            select: '-rundown'
          },
          {
            path: 'clueFilters'
          }
        ]
      })
      .populate('shop')
      .populate('hostUser')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findUnique(params: any): Promise<IGameModel> {
    return await Game.findOne(params).exec();
  }

  async saveOrUpdate(game, opt: object = {}): Promise<IGameModel> {
    const options = {
      ...opt,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { shop, script, startTime, hostUser, status } = game;
    return await Game.findOneAndUpdate({ shop, script, startTime, status, hostUser }, game, options).exec();
  }
}

export default new GamesRepo();
