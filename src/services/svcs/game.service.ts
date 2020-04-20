import { IGameModel } from '../../data/repositories/game/game.model';
import { IGamePlayerModel } from '../../data/repositories/game/gamePlayer.model';
import { IGameScriptClueModel } from '../../data/repositories/game/gameScriptClue.model';
import { IScriptRundownModel } from '../../data/repositories/script/scriptRundown.model';
import { IUserModel } from '../../data/repositories/user/user.model';

import GenericService from './generic.service';
import CacheService from './cache.service';

import ScriptsRepo from '../../data/repositories/script/scripts.repository';
import UsersRepo from '../../data/repositories/user/users.repository';
import ShopsRepo from '../../data/repositories/shop/shops.repository';
import GamesRepo from '../../data/repositories/game/games.repository';
import GamePlayersRepo from '../../data/repositories/game/gamePlayers.repository';
import GameScriptCluesRepo from '../../data/repositories/game/gameScriptClues.repository';

import { nowDate, formatDate, add } from '../../utils/dateUtil';
import { randomSerialNumber } from '../../utils/stringUtil';
import config from '../../config';
import {
  InvalidRequestException,
  ResourceAlreadyExistException,
  ResourceNotFoundException,
  AccessDeniedException,
  CannotJoinGameException,
  CannotLeaveGameException
} from '../../exceptions/custom.exceptions';
import logger from '../../middleware/logger.middleware';

class GameService extends GenericService {
  async findById(id): Promise<IGameModel> {
    return await GamesRepo.findById(id);
  }
  async getGames(params: { keyword?: string; offset?: number; limit?: number }, filter: any, sort: any): Promise<any> {
    return await GamesRepo.find(params, filter, sort);
  }

  async findGamesByRoomCodeAndStatus(roomId: string, status: string, code?: string): Promise<IGameModel[]> {
    if (code) {
      return await GamesRepo.findByParams({ roomId, code, status });
    } else {
      return await GamesRepo.findByParams({ roomId, status });
    }
  }

  /**
   * Add new game.
   * 1. add new game
   * 2. add new game players
   * 3. add game clues
   * @param {[type]} params [description]
   */
  async addGame(user: IUserModel, params: any): Promise<IGameModel> {
    const { shopId, scriptId, startTime, hostUserId, hostComment, price, code, hostUserMobile, hostUserWechatId } = params;
    // let { numberOfOfflinePlayers, isHostJoin, supportPayment } = req.body;
    if (!scriptId) {
      throw new InvalidRequestException('AddGame', ['scriptId']);
    }
    if (!shopId) {
      throw new InvalidRequestException('AddGame', ['shopId']);
    }
    if (!hostUserId) {
      throw new InvalidRequestException('AddGame', ['hostUserId']);
    }
    if (!hostUserMobile) {
      throw new InvalidRequestException('AddGame', ['hostUserMobile']);
    }
    if (!hostUserWechatId) {
      throw new InvalidRequestException('AddGame', ['hostUserWechatId']);
    }
    if (!startTime) {
      throw new InvalidRequestException('AddGame', ['startTime']);
    }
    if (!code) {
      throw new InvalidRequestException('AddGame', ['code']);
    }
    const script = await ScriptsRepo.findById(scriptId, true);
    if (!script) {
      throw new ResourceNotFoundException('Script', scriptId);
    }
    const shop = await ShopsRepo.findById(shopId);
    if (!shop) {
      throw new ResourceNotFoundException('Shop', shopId);
    }
    const hostUser = await UsersRepo.findById(hostUserId);
    if (!hostUser) {
      throw new ResourceNotFoundException('User', hostUserId);
    }
    const { minNumberOfSpots, duration, rundowns, clues } = script;
    if (!rundowns) {
      logger.warn(`Script does not have any rundowns`);
      throw new InvalidRequestException('AddGame', ['scriptId']);
    }

    const session = await this.getSession();
    session.startTransaction();
    try {
      const dtStartTime = formatDate(startTime, config.eventDateFormatParse);
      const dtEndTime = add(startTime, duration, 'm');

      const opts = { session };
      const game = await GamesRepo.findUnique({
        shop: shopId,
        script: scriptId,
        startTime: dtStartTime,
        status: 'ready',
        hostUser: hostUserId
      });
      if (game) {
        throw new ResourceAlreadyExistException('Game', ['shop', 'script', 'startTime', 'status', 'hostUser']);
      }
      // create a new game
      const newGame = await GamesRepo.saveOrUpdate(
        {
          shop: shopId,
          script: scriptId,
          startTime: dtStartTime,
          endTime: dtEndTime,
          hostUser: hostUserId,
          hostUserMobile,
          hostUserWechatId,
          hostComment,
          numberOfPersons: minNumberOfSpots,
          roomId: randomSerialNumber(8),
          code,
          price,
          status: 'ready',
          createdAt: nowDate()
        },
        opts
      );
      const { _id: gameId } = newGame;
      // create gamePlayers entries for each player
      const gamePlayersPromises = rundowns.map(async rundown => {
        const { playerId } = rundown;
        let gamePlayerToAdd = {
          game: gameId,
          playerId
        };
        if (playerId === '0') {
          gamePlayerToAdd = Object.assign(gamePlayerToAdd, {
            user: hostUserId
          });
        }
        // console.log(gamePlayerToAdd);
        return await GamePlayersRepo.saveOrUpdate(gamePlayerToAdd, opts);
      });
      await Promise.all(gamePlayersPromises);

      // create game script clues list
      const gameScriptCluespromises = clues.map(async clue => {
        const { _id: scriptClueId } = clue;
        const gameScriptClueToAdd = {
          game: gameId,
          scriptClue: scriptClueId,
          owner: '0', // default all clues are owned by DM
          isPublic: false,
          hasRead: false
        };
        return await GameScriptCluesRepo.saveOrUpdate(gameScriptClueToAdd, opts);
      });
      await Promise.all(gameScriptCluespromises);

      await session.commitTransaction();
      await this.endSession();
      return newGame;
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }

  async joinGame(user: any, game: any, playerId: string): Promise<IGamePlayerModel> {
    const { _id: userId } = user;
    const { _id: gameId, code } = game;
    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };
      const { players, code: roomCode } = game;

      let matchedPlayer = players.find(player => {
        const { user: srcUserId } = player;
        return srcUserId && srcUserId.toString() === userId.toString();
      });
      //  If found logged in user already in players but as another playerId, throw an error
      // same user can only take one player in one game
      if (matchedPlayer && matchedPlayer.playerId !== playerId) {
        throw new CannotJoinGameException(gameId, `${userId} has already taken another player`);
      }

      matchedPlayer = players.find(player => {
        const { playerId: srcPlayerId } = player;
        return srcPlayerId === playerId;
      });
      if (roomCode != code) {
        throw new CannotJoinGameException(gameId, `${code} is not valid`);
      }
      if (!matchedPlayer) {
        throw new CannotJoinGameException(gameId, `${playerId} is not valid player`);
      }
      const { user } = matchedPlayer;
      if (user) {
        throw new CannotJoinGameException(gameId, `${playerId} is already taken`);
      }

      const gamePlayerToUpdate = Object.assign(matchedPlayer.toObject(), {
        user: userId,
        updatedAt: nowDate()
      });
      const newGamePlayer = await GamePlayersRepo.saveOrUpdate(gamePlayerToUpdate, opts);
      await session.commitTransaction();
      await this.endSession();
      return newGamePlayer;
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }

  async leaveGame(user: any, game: any, playerId: string): Promise<IGamePlayerModel> {
    const { _id: userId } = user;
    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };
      const { _id: gameId, players } = game;
      const matchedPlayer = players.find(player => {
        const { user: srcUserId } = player;
        return srcUserId && userId.toString() === srcUserId.toString();
      });
      if (!matchedPlayer) {
        throw new CannotLeaveGameException(gameId, `You are not joined yet`);
      }
      const { playerId: srcPlayerId } = matchedPlayer;
      // check if the player id is matched
      if (srcPlayerId != playerId) {
        throw new CannotLeaveGameException(gameId, `Player id is not matched`);
      }

      const gamePlayerToUpdate = Object.assign(matchedPlayer.toObject(), {
        user: undefined,
        updatedAt: nowDate()
      });
      // console.log(gamePlayerToUpdate);
      const newGamePlayer = await GamePlayersRepo.saveOrUpdate(gamePlayerToUpdate, opts);
      await session.commitTransaction();
      await this.endSession();
      return newGamePlayer;
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }

  async getScriptRundownByPlayer(loggedInUser: IUserModel, gameId: string, playerId: string): Promise<IScriptRundownModel> {
    try {
      const game = await GamesRepo.findById(gameId, ['rundowns']);
      if (!game) {
        throw new ResourceNotFoundException('Game', gameId);
      }
      const { script } = game;
      const { rundowns } = script;
      const scriptRundown = rundowns.find(rundown => {
        const { playerId: pId } = rundown;
        return pId === playerId;
      });
      return scriptRundown;
    } catch (err) {
      throw err;
    }
  }

  async getGameScriptCluesByPlayer(loggedInUser: IUserModel, gameId: string, playerId: string): Promise<any[]> {
    try {
      const game = await GamesRepo.findById(gameId, ['rundowns']);
      if (!game) {
        throw new ResourceNotFoundException('Game', gameId);
      }
      const gameScriptClues = await GameScriptCluesRepo.findGameScriptCluesByPlayerId(game, playerId);
      return gameScriptClues.map(_ => {
        const { scriptClue, isPublic, owner, hasRead, id, _id } = _;
        return {
          scriptClue,
          isPublic,
          owner,
          hasRead: hasRead ? hasRead : false,
          id,
          _id
        };
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update game script clue. It's used when DM try to distribute clues to players.
   *
   * @param {any} loggedInUser   [description]
   * @param {any} game           [description]
   * @param {any} gameScriptClue [description]
   */
  async updateGameScriptClue(loggedInUser: any, game: any, scriptClueId: string, params: any): Promise<IGameScriptClueModel> {
    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };
      const { playerId: playerIdToUpdate, isPublic, hasRead } = params;
      const { id: gameId, players } = game;
      const { id: loggedInUserId } = loggedInUser;

      const player = this.getPlayerByUser(players, loggedInUserId);
      if (!player) {
        throw new AccessDeniedException(loggedInUserId, 'You are not in the game.');
      }
      const { playerId: ownerPlayerId } = player;
      const gameScriptClues = await GameScriptCluesRepo.find({
        game: gameId,
        scriptClue: scriptClueId,
        owner: ownerPlayerId
      });
      if (!gameScriptClues || gameScriptClues.length === 0) {
        throw new ResourceNotFoundException('GameScriptClue', `${gameId}|${scriptClueId}|${loggedInUserId}`);
      }
      if (gameScriptClues.length > 1) {
        logger.warn(`Found more than one scriptClue for game ${gameId}, scriptClue ${scriptClueId}, pick the first one`);
      }
      const gameScriptClue = gameScriptClues[0];
      // const { owner } = gameScriptClue;

      let gameScriptClueToUpdate = gameScriptClue.toObject();
      if (typeof playerIdToUpdate !== 'undefined') {
        gameScriptClueToUpdate = Object.assign(gameScriptClueToUpdate, {
          owner: playerIdToUpdate,
          hasRead: false,
          updatedAt: nowDate()
        });
      }

      // if mark a clue to be public, copy this clue to all players of this game, and mark isPublic flag of owner to be true.
      if (typeof isPublic !== 'undefined' && isPublic) {
        const dataToUpdate = Object.assign(gameScriptClueToUpdate, {
          isPublic,
          updatedAt: nowDate()
        });
        await GameScriptCluesRepo.saveOrUpdate(dataToUpdate, opts);
        await this.createPublicClues(game, gameScriptClue, opts);
      }
      if (typeof hasRead !== 'undefined') {
        gameScriptClueToUpdate = Object.assign(gameScriptClueToUpdate, {
          hasRead,
          updatedAt: nowDate()
        });
      }
      const newGameScriptClue = await GameScriptCluesRepo.saveOrUpdate(gameScriptClueToUpdate, opts);
      // flush cache
      await CacheService.purgeGameScriptClueCache(game);
      await session.commitTransaction();
      await this.endSession();
      return newGameScriptClue;
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }

  async createPublicClues(game: any, gameScriptClue: any, opts: any): Promise<IGameScriptClueModel[]> {
    const { id: gameId, players } = game;
    const { scriptClue: scriptClueId } = gameScriptClue;
    const responses = [];
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const { playerId } = player;
      const gameScriptClues = await GameScriptCluesRepo.find({
        game: gameId,
        scriptClue: scriptClueId,
        owner: playerId
      });
      let gameScriptClue = undefined;
      if (gameScriptClues && gameScriptClues.length > 0) {
        gameScriptClue = gameScriptClues[0];
      }
      logger.info(`Created/Update game script clues from game ${gameId}, scriptClue ${scriptClueId}, playerId: ${playerId}`);
      if (!gameScriptClue) {
        // create new public, unread clue for playerId
        const gameScriptClueToAdd = {
          game: gameId,
          scriptClue: scriptClueId,
          isPublic: true,
          owner: playerId,
          hasRead: false
        };
        responses.push(await GameScriptCluesRepo.saveOrUpdate(gameScriptClueToAdd, opts));
      } else {
        // entry is already exists
        const gameScriptClueToUpdate = Object.assign(gameScriptClue.toObject(), { isPublic: true });
        responses.push(await GameScriptCluesRepo.saveOrUpdate(gameScriptClueToUpdate, opts));
      }
    }
    return responses;
  }

  getPlayerByUser(players, userId: string): IGamePlayerModel {
    const player = players.find(player => {
      // console.log(player);
      const { user: gamePlayerId } = player;
      // console.log(gamePlayerId + ' , ' + userId);
      return gamePlayerId && gamePlayerId.toString() === userId;
    });
    return player;
  }

  async getGameScriptByRoomAndCode(roomId: string, code: string): Promise<IGameModel> {
    const games = await GamesRepo.findByParams({
      roomId,
      code,
      status: 'ready'
    });
    if (games.length === 0) {
      return null;
    }
    if (games.length > 1) {
      logger.warn(`More than one game is found`);
      throw new InvalidRequestException('Game', ['roomId', 'code']);
    }
    return games[0];
  }

  async updateGame(game: IGameModel): Promise<IGameModel> {
    return await GamesRepo.saveOrUpdate(game);
  }

  async deleteGame(game: IGameModel): Promise<IGameModel> {
    try {
      const newGame = await GamesRepo.saveOrUpdate(game);
      return newGame;
    } catch (err) {
      throw err;
    }
  }
}

export default new GameService();
