import { Route, Path, Query, Post, Get, Put, Delete, SuccessResponse, Tags, Body, OperationId, Request, Response, Security } from 'tsoa';
import { IAddGameRequest, IJoinGameRequest, ILeaveGameRequest, IUpdateGameRequest } from '../requests';
import { IResponse, IErrorResponse } from '../responses';
import logger from '../../middleware/logger.middleware';
import config from '../../config';

import GenericController from './generic.controller';
import GameService from '../svcs/game.service';

import { formatDate, add } from '../../utils/dateUtil';
import { InvalidRequestException, ResourceNotFoundException, GameCannotCancelException } from '../../exceptions/custom.exceptions';

@Route('games')
export class GamesController extends GenericController {
  @Get('')
  @Tags('game')
  @OperationId('getGames')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getGames(
    @Request() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('keyword') keyword?: string,
    @Query('filter') filterStr?: string,
    @Query('sort') sortStr?: string
  ): Promise<IResponse> {
    try {
      // let offset = parseInt(req.query.offset);
      // let limit = parseInt(req.query.limit);
      // const { keyword, filter: filterStr, sort: sortStr } = req.query;
      let filterToUpdate = { status: ['ready'], availableSpots: -1 };
      let sortToUpdate = {};
      if (filterStr) {
        const filter = JSON.parse(decodeURIComponent(filterStr));
        filterToUpdate = Object.assign(filterToUpdate, filter);
        // console.log(filterToUpdate);
      }
      if (sortStr) {
        const sort = JSON.parse(decodeURIComponent(sortStr));
        sortToUpdate = Object.assign(sortToUpdate, sort);
      }
      if (!offset) {
        offset = config.query.offset;
      }
      if (!limit) {
        limit = config.query.limit;
      }
      // console.log(filterToUpdate);
      let result = await GameService.getGames({ keyword, offset, limit }, filterToUpdate, sortToUpdate);
      const links = this.generateLinks(result.pagination, req.originalUrl, '');
      result = Object.assign({}, result, links);
      return { code: 'SUCCESS', data: result };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get game script summary by room id and code, it's used for get brief description of a games and its players, details information such as rundowns and clues, should be fetched separately using other apis.
   *
   * @param {[type]} '/{roomId}/code/{code}' [description]
   */
  @Get('/{roomId}/code/{code}')
  @Tags('game')
  @OperationId('getGameScriptByRoomAndCode')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getGameScriptByRoomAndCode(@Path('roomId') roomId: string, @Path('code') code: string): Promise<IResponse> {
    // const { roomId, code } = req.params;
    try {
      const gameScript = await GameService.getGameScriptByRoomAndCode(roomId, code);
      return { code: 'SUCCESS', data: gameScript };
    } catch (err) {
      throw err;
    }
  }

  @Post()
  @Tags('game')
  @OperationId('addGame')
  @Security('access_token', ['game:addGame'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async addGame(@Request() req: any, @Body() body: IAddGameRequest): Promise<IResponse> {
    const { user: loggedInUser } = req;
    try {
      const game = await GameService.addGame(loggedInUser, body);
      return { code: 'SUCCESS', data: game };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Join a game.
   *
   * @param {[type]} '/join' [description]
   */
  @Post('/join')
  @Tags('game')
  @OperationId('joinGame')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async join(@Request() req: any, @Body() body: IJoinGameRequest): Promise<any> {
    const { user: loggedInUser } = req;
    const { roomId, playerId, code } = body;
    try {
      const games = await GameService.findGamesByRoomCodeAndStatus(roomId, code, 'ready');
      if (!games || games.length === 0) {
        throw new ResourceNotFoundException('Game', `${roomId}|${code}`);
      }
      if (games.length > 1) {
        logger.warn(`More than one game is found`);
        throw new InvalidRequestException('Game', ['roomId', 'code', 'status']);
      }
      const game = games[0];
      const gamePlayer = await GameService.joinGame(loggedInUser, game, playerId);
      return { code: 'SUCCESS', data: gamePlayer };
    } catch (err) {
      throw err;
    }
  }

  /**
   * leave a game.
   *
   * @param {[type]} '/leave' [description]
   */
  @Post('/leave')
  @Tags('game')
  @OperationId('leaveGame')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async leave(@Request() req: any, @Body() body: ILeaveGameRequest): Promise<IResponse> {
    const { user: loggedInUser } = req;
    const { roomId, playerId } = body;
    try {
      const games = await GameService.findGamesByRoomCodeAndStatus(roomId, 'ready');
      if (!games || games.length === 0) {
        throw new ResourceNotFoundException('Game', `${roomId}`);
      }
      if (games.length > 1) {
        logger.warn(`More than one game is found`);
        throw new InvalidRequestException('Game', ['roomId', 'status']);
      }
      const game = games[0];
      const gamePlayer = await GameService.leaveGame(loggedInUser, game, playerId);
      return { code: 'SUCCESS', data: gamePlayer };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get game script rundown by player id.
   *
   * @param {[type]} '/{gameId}/script-rundown/{playerId}' [description]
   */
  @Get('/{gameId}/script-rundown/{playerId}')
  @Tags('game')
  @OperationId('getGameScriptRundownByPlayer')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getScriptRundownByPlayer(@Request() req: any, @Path('gameId') gameId: string, @Path('playerId') playerId: string): Promise<IResponse> {
    const { user: loggedInUser } = req;
    // const { gameId, playerId } = req.params;
    try {
      const scriptRundown = await GameService.getScriptRundownByPlayer(loggedInUser, gameId, playerId);
      return { code: 'SUCCESS', data: scriptRundown };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get game script clues by player id.
   *
   * @param {[type]} '/{gameId}/clues/{playerId}' [description]
   */
  @Get('/{gameId}/clues/{playerId}')
  @Tags('game')
  @OperationId('getGameScriptCluesByPlayer')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getGameScriptCluesByPlayer(@Request() req: any, @Path('gameId') gameId: string, @Path('playerId') playerId: string): Promise<IResponse> {
    const { user: loggedInUser } = req;
    // const { gameId, playerId } = req.params;
    try {
      const gameScriptClues = await GameService.getGameScriptCluesByPlayer(loggedInUser, gameId, playerId);
      return { code: 'SUCCESS', data: gameScriptClues };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update a game script clue.
   *
   * @param {[type]} '/{gameId}/clues/{scriptClueId}' [description]
   */
  @Put('/{gameId}/clues/{scriptClueId}')
  @Tags('game')
  @OperationId('updateGameScriptClue')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async updateGameScriptClue(@Request() req: any, @Path('gameId') gameId: string, @Path('scriptClueId') scriptClueId: string): Promise<IResponse> {
    const { user: loggedInUser } = req;
    // const { _id: loggedInUserId } = loggedInUser;
    try {
      const game = await GameService.findById(gameId);
      if (!game) {
        throw new ResourceNotFoundException('Game', gameId);
      }

      const newGameScriptClue = await GameService.updateGameScriptClue(loggedInUser, game, scriptClueId, req.body);
      return { code: 'SUCCESS', data: newGameScriptClue };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update a game.
   *
   * @param {[type]} '/{gameId}' [description]
   */
  @Put('/{gameId}')
  @Tags('game')
  @OperationId('updateGame')
  @Security('access_token', ['game:updateGame'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async updateGame(@Request() req: any, @Path('gameId') gameId: string, @Body() body: IUpdateGameRequest): Promise<IResponse> {
    // const { user: loggedInUser } = req;
    try {
      const { startTime, hostComment } = body;
      // const { gameId } = req.params;
      const game = await GameService.findById(gameId);
      if (!game) {
        throw new ResourceNotFoundException('Game', gameId);
      }

      const updateData = {};
      if (startTime) {
        updateData['startTime'] = formatDate(startTime, config.eventDateFormatParse);
        const {
          script: { duration }
        } = game;
        const endTime = add(startTime, duration, 'm');
        if (endTime) {
          updateData['endTime'] = endTime;
        }
        if (hostComment) {
          updateData['hostComment'] = hostComment;
        }
      }
      const newGame = await GameService.updateGame(game);
      return { code: 'SUCCESS', data: newGame };
    } catch (err) {
      throw err;
    }
  }

  @Delete('/{gameId}')
  @Tags('game')
  @OperationId('deleteGame')
  @Security('access_token', ['game:deleteGame'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async deleteGame(@Request() req: any, @Path('gameId') gameId: string): Promise<IResponse> {
    // const { gameId } = req.params;
    try {
      const game = await GameService.findById(gameId);
      if (!game) {
        throw new ResourceNotFoundException('Game', gameId);
      }
      const { status: currentStatus } = game;
      if (currentStatus !== 'ready') {
        throw new GameCannotCancelException(gameId);
      }
      const gameToUpdate = Object.assign(game.toObject(), {
        status: 'cancelled'
      });
      const newGame = await GameService.deleteGame(gameToUpdate);
      return { code: 'SUCCESS', data: newGame };
    } catch (err) {
      throw err;
    }
  }
}
