import { model } from 'mongoose';
import { IGameModel } from './game.model';
import { IGamePlayerModel } from './gamePlayer.model';
import { IUserModel } from '../user/user.model';
import { GamePlayerSchema } from './gamePlayer.schema';
const GamePlayer = model<IGamePlayerModel>('GamePlayer', GamePlayerSchema, 'gamePlayers');

// mongoose.set('useFindAndModify', false);

class GamePlayersRepo {
  async findByUser(user: IUserModel, status: string[] = ['ready', 'completed']): Promise<IGamePlayerModel[]> {
    return await GamePlayer.find({ user })
      .populate({
        path: 'game',
        match: {
          status: { $in: status }
        },
        populate: [
          {
            path: 'players'
          },
          { path: 'script' },
          { path: 'shop' },
          { path: 'hostUser' }
        ]
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByGameAndPlayerId(game: IGameModel, playerId: string): Promise<IGamePlayerModel> {
    return await GamePlayer.findOne({ game, playerId }).exec();
  }

  async saveOrUpdate(gamePlayer, opt: object = {}): Promise<IGamePlayerModel> {
    const options = {
      ...opt,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { _id: gameId, game, playerId, createdAt } = gamePlayer;
    if (gameId) {
      // await gamePlayer.save();
      // return gamePlayer;
      return await GamePlayer.findOneAndUpdate({ _id: gameId }, gamePlayer, options).exec();
    } else {
      return await GamePlayer.findOneAndUpdate({ game, playerId, createdAt }, gamePlayer, options).exec();
    }
  }
}

export default new GamePlayersRepo();
