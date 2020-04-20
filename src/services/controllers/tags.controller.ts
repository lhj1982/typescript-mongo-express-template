import { Route, Get, SuccessResponse, Tags, OperationId, Response, Security } from 'tsoa';
import GenericController from './generic.controller';
import { IResponse, IErrorResponse } from '../responses';

import TagService from '../svcs/tag.service';

@Route('tags')
export class TagsController extends GenericController {
  @Get()
  @Tags('tag')
  @OperationId('getTags')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getTags(): Promise<IResponse> {
    try {
      const tags = await TagService.getTags();
      return {
        code: 'SUCCESS',
        data: tags
      };
    } catch (err) {
      throw err;
    }
  }
}
