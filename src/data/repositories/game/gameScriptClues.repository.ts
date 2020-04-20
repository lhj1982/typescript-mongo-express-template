import { model } from 'mongoose';
import { IGameModel } from './game.model';
import { IGameScriptClueModel } from './gameScriptClue.model';
import { GameScriptClueSchema } from './gameScriptClue.schema';
const GameScriptClue = model<IGameScriptClueModel>('GameScriptClue', GameScriptClueSchema, 'gameScriptClues');

// mongoose.set('useFindAndModify', false);

class GameScriptCluesRepo {
  async find(params: any): Promise<IGameScriptClueModel[]> {
    return await GameScriptClue.find(params).exec();
  }

  // async findByGameAndScriptClue(gameId: string, scriptClueId: string, playerId: string) {
  //   return await GameScriptClue.findOne({
  //     game: gameId,
  //     scriptClue: scriptClueId,
  //     owner: playerId
  //   }).exec();
  // }

  async findGameScriptCluesByPlayerId(game: IGameModel, playerId: string): Promise<IGameScriptClueModel[]> {
    return await GameScriptClue.find({
      game,
      owner: playerId
    })
      .populate('game')
      .populate({
        path: 'scriptClue'
      })
      .exec();
  }

  async saveOrUpdate(gameScriptClue, opt: object = {}): Promise<IGameScriptClueModel> {
    const options = {
      ...opt,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { _id, scriptClue, game, owner } = gameScriptClue;
    if (_id) {
      return await GameScriptClue.findOneAndUpdate({ _id }, gameScriptClue, options).exec();
    } else {
      return await GameScriptClue.findOneAndUpdate({ scriptClue, game, owner }, gameScriptClue, options).exec();
    }
  }
}

export default new GameScriptCluesRepo();
