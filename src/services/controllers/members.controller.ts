import { Route, Post, Get, SuccessResponse, Tags, Body, OperationId, Response, Security } from 'tsoa';
import { IBatchCreateMemberCardsRequest } from '../requests';
import { IResponse, IErrorResponse } from '../responses';
import logger from '../../middleware/logger.middleware';
import config from '../../config';

import { InvalidRequestException, ResourceNotFoundException } from '../../exceptions/custom.exceptions';
import GenericController from './generic.controller';
// import NotificationsRepo from '../repositories/notifications.repository';
import MemberService from '../svcs/member.service';

@Route('members')
export class MembersController extends GenericController {
  @Get('/available-member-card-types')
  @Tags('member')
  @OperationId('getAvailableMemberCardTypes')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getAvailableMemberCardTypes(): Promise<IResponse> {
    try {
      const types = await MemberService.getMemberCardTypes();
      return { code: 'SUCCESS', data: types };
    } catch (err) {
      throw err;
    }
  }

  @Post('/batch-add-member-cards')
  @Tags('member')
  @OperationId('batchCreateMemberCards')
  @Security('access_token', ['member:batchCreateMemberCards'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async batchCreateMemberCards(@Body() body: IBatchCreateMemberCardsRequest): Promise<IResponse> {
    try {
      const { count, cardTypeId } = body;
      const memberCardType = await MemberService.findMemberCardTypeById(cardTypeId);
      if (!memberCardType) {
        throw new ResourceNotFoundException('MemberCardType', cardTypeId);
      }
      if (count > config.member.maxNumberOfMemberCardToCreateInBatch) {
        logger.error(`Cannot create more than ${config.member.maxNumberOfMemberCardToCreateInBatch} member cards`);
        throw new InvalidRequestException('MemberCard', ['count']);
      }
      const cards = await MemberService.createMemberCards(count, memberCardType);

      return {
        code: 'SUCCESS',
        data: cards.map(_ => {
          return _.redeemCode;
        })
      };
    } catch (err) {
      throw err;
    }
  }
}
