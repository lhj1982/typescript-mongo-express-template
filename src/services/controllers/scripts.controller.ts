import { Route, Get, Post, Delete, SuccessResponse, Tags, Body, Path, Query, OperationId, Request, Response, Security } from 'tsoa';
import { IAddScriptRequest } from '../requests';
import { IResponse, IErrorResponse } from '../responses';
import GenericController from './generic.controller';
import config from '../../config';
// import logger from '../../middleware/logger.middleware';

import { InvalidRequestException } from '../../exceptions/custom.exceptions';
import ScriptService from '../svcs/script.service';

@Route('scripts')
export class ScriptsController extends GenericController {
  /**
   * List all scripts.
   */
  @Get()
  @Tags('script')
  @OperationId('listScripts')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getScripts(@Request() req: any, @Query() keyword?: string, @Query() offset?: number, @Query() limit?: number): Promise<IResponse> {
    try {
      // let offset = parseInt(req.query.offset);
      // let limit = parseInt(req.query.limit);
      // const { keyword } = req.query;
      if (!offset) {
        offset = config.query.offset;
      }
      if (!limit) {
        limit = config.query.limit;
      }
      let result = await ScriptService.find({ keyword, offset, limit });
      const links = this.generateLinks(result.pagination, req.originalUrl, '');
      result = Object.assign({}, result, links);

      return { code: 'SUCCESS', data: result };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get script feed.
   *
   * @param {[type]} '/feed' [description]
   */
  @Get('/feed')
  @Tags('script')
  @OperationId('getScriptFeed')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getScriptsFeed(@Query('discountKey') discountKey?: string, @Query('limit') limit?: number): Promise<IResponse> {
    // const { discountKey } = req.query;
    // let { limit } = req.query;
    // console.log(discountKey);
    console.log(discountKey);
    const scripts = await ScriptService.findScriptsByDiscountKeys(discountKey, limit);
    return { code: 'SUCCESS', data: scripts };
  }

  /**
   * Get one script by id.
   *
   * @param {[type]} '/{scriptId}' [description]
   */
  @Get('/{scriptId}')
  @Tags('script')
  @OperationId('getScriptById')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getScript(@Path('scriptId') scriptId: string, @Query('extended') extended?: string): Promise<IResponse> {
    // const { scriptId } = req.params;
    // const { extended } = req.query;
    try {
      const script = await ScriptService.findById(scriptId, extended === 'true');
      return { code: 'SUCCESS', data: script };
    } catch (err) {
      throw err;
    }
  }

  // getScriptExtended = async (req: Request, res: Response, next: NextFunction) => {
  //   const { scriptId } = req.params;
  //   try {
  //     const script = await ScriptService.findById(scriptId, true);
  //     res.json({ code: 'SUCCESS', data: script });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  /**
   * Create a new script.
   */
  @Post()
  @Tags('script')
  @OperationId('createScript')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async addScript(@Body() body: IAddScriptRequest): Promise<IResponse> {
    // console.log(req);
    const { key, name, description, minNumberOfSpots, maxNumberOfSpots, duration, coverImage, tags } = body;
    try {
      if (!key) {
        throw new InvalidRequestException('AddScript', ['key']);
      }

      const scriptToAdd = {
        key,
        name,
        description,
        minNumberOfSpots,
        maxNumberOfSpots,
        duration,
        coverImage,
        tags,
        createdAt: new Date()
      };
      const newScript = await ScriptService.addScript(scriptToAdd);

      return { code: 'SUCCESS', data: newScript };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Add script to watch list.
   *
   * @param {[type]} '/{scriptId}/watch' [description]
   */
  @Post('/{scriptId}/watch')
  @Tags('script')
  @OperationId('addScriptToWatchList')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async addToWatchList(@Request() req: any, @Path('scriptId') scriptId: string): Promise<IResponse> {
    const { user: loggedInUser } = req;
    // const { scriptId } = req.params;
    try {
      const resp = await ScriptService.addToWatchList(scriptId, loggedInUser);
      return { code: 'SUCCESS', data: resp };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Remove script from watch list.
   *
   * @param {[type]} '/{scriptId}/watch' [description]
   */
  @Delete('/{scriptId}/watch')
  @Tags('script')
  @OperationId('removeScriptToWatchList')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async removeFromWatchList(@Request() req: any, @Path('scriptId') scriptId: string): Promise<IResponse> {
    const { user: loggedInUser } = req;
    // const { scriptId } = req.params;
    try {
      const resp = await ScriptService.removeFromWatchList(scriptId, loggedInUser);
      return { code: 'SUCCESS', data: resp };
    } catch (err) {
      throw err;
    }
  }
}
