import GenericService from './generic.service';
import OrderService from './order.service';
import config from '../../config';
import logger from '../../middleware/logger.middleware';

import { ResourceNotFoundException, InvalidMemberCardException } from '../../exceptions/custom.exceptions';
import { IMemberModel } from '../../data/repositories/member/member.model';
import { IMemberCardModel } from '../../data/repositories/member/memberCard.model';
import { IMemberCardTypeModel } from '../../data/repositories/member/memberCardType.model';
import { IUserModel } from '../../data/repositories/user/user.model';

import MembersRepo from '../../data/repositories/member/members.repository';
import MemberCardsRepo from '../../data/repositories/member/memberCards.repository';
import MemberCardTypesRepo from '../../data/repositories/member/memberCardTypes.repository';
import { randomSerialNumber, getRandomString } from '../../utils/stringUtil';
import { date2moment, nowDate, addDays2 } from '../../utils/dateUtil';

class MemberService extends GenericService {
  async getMemberCardTypes(): Promise<IMemberCardTypeModel[]> {
    return await MemberCardTypesRepo.find({});
  }

  async findMemberCardTypeById(id: string): Promise<IMemberCardTypeModel> {
    return await MemberCardTypesRepo.findById(id);
  }

  async createMemberCards(count: number, memberCardType: IMemberCardTypeModel): Promise<IMemberCardModel[]> {
    const batchesSize = this.getBatchSize(config.member.maxNumberOfMemberCardToCreateInBatch);
    let memberCards = [];
    for (let i = 0; i < batchesSize; i++) {
      logger.info(`Processing batch ${i}...`);
      const iteratorCount = (i + 1) * config.server.dbBatchSize > count ? count - i * config.server.dbBatchSize : config.server.dbBatchSize;
      // console.log(iteratorCount);
      const promises = Array(iteratorCount)
        .fill(0)
        .map(async _ => {
          const redeemCode = getRandomString(16);
          const memberCard = await this.createMemberCard({
            cardType: memberCardType,
            redeemCode
          });
          return memberCard;
        });

      const cards = await Promise.all(promises);
      memberCards = memberCards.concat(cards);
    }
    return memberCards;
  }

  /**
   * Create a member card.
   *
   * @param  {string}}                  params [description]
   * @param  {any                    =      {}}        options [description]
   * @return {Promise<IMemberCardModel>}        [description]
   */
  async createMemberCard(
    params: {
      owner?: IUserModel;
      cardType: IMemberCardTypeModel;
      redeemCode?: string;
    },
    options: any = {}
  ): Promise<IMemberCardModel> {
    const { owner, cardType, redeemCode } = params;
    const newMemberCard = await MemberCardsRepo.saveOrUpdate(
      {
        owner,
        cardNo: randomSerialNumber(config.member.memberCardNoLength),
        cardType,
        description: 'vip会员卡',
        status: 'active',
        redeemCode,
        createdAt: nowDate()
      },
      options
    );
    return newMemberCard;
  }

  async subscribeNewMember(user: IUserModel, memberCardType: IMemberCardTypeModel): Promise<any> {
    const { id: userId } = user;
    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };
      const { discountPrice } = memberCardType;
      let { price } = memberCardType;
      if (await this.isFirstTimeMember(user)) {
        logger.info(`First time member ${userId}, price from ${price} to ${discountPrice}`);
        price = discountPrice;
      }
      // create a member card
      const newMemberCard = await this.createMemberCard({ owner: user, cardType: memberCardType }, opts);
      // create an order
      const order = {
        createdBy: userId,
        type: 'member_card_purchase',
        amount: (price * 100).toFixed(),
        objectId: newMemberCard.id,
        outTradeNo: getRandomString(32),
        orderStatus: 'created'
      };
      const newOrder = await OrderService.createOrder(order, opts);
      logger.info(`Order ${newOrder.outTradeNo} is created for ${userId}`);
      await session.commitTransaction();
      await this.endSession();

      return { memberCard: newMemberCard, order: newOrder };
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }

  /**
   * If there is a used member card for given user, he/she is not first time member.
   *
   * @param  {IUserModel}       user [description]
   * @return {Promise<boolean>}      [description]
   */
  async isFirstTimeMember(user: IUserModel): Promise<boolean> {
    const memberCards = await MemberCardsRepo.find({
      owner: user,
      status: ['used']
    });
    return !memberCards || memberCards.length === 0;
  }

  /**
   * Update member card status.
   * Update member status.
   * If new member, create new instance, otherwsie, extend member expiry date
   *
   * @param  {string}                memberCardId [description]
   * @param  {any                =            {}}        opts [description]
   * @return {Promise<IMemberModel>}              [description]
   */
  async updateMemeberStatusPerPayment(memberCardId: string, opts: any = {}): Promise<IMemberModel> {
    const memberCard = await MemberCardsRepo.findById(memberCardId);
    const {
      owner,
      status,
      cardType: { durationInDays }
    } = memberCard;
    if (status !== 'active') {
      logger.error(`MemberCard ${memberCardId} has invalid status ${status}, cannot be used`);
      throw new InvalidMemberCardException(memberCardId);
    }
    // update member card status
    const memberCardToUpdate = Object.assign(memberCard.toObject(), {
      status: 'used'
    });
    await MemberCardsRepo.saveOrUpdate(memberCardToUpdate, opts);
    const newMember = await this.subscribeMember(owner, durationInDays, opts);
    return newMember;
  }

  /**
   * Subscribe a member,
   * if new member, set expired from current date
   * if old member and still active, prolong expiryDate
   * if old member but expired, create new expirey date from current date.
   *
   * @param  {IUserModel}            owner          [description]
   * @param  {number}                durationInDays [description]
   * @return {Promise<IMemberModel>}                [description]
   */
  async subscribeMember(owner: IUserModel, durationInDays: number, options: any = {}): Promise<IMemberModel> {
    const member = await MembersRepo.findByUser(owner);
    let memberToUpdate = {};
    const now = nowDate();
    if (!member) {
      const expiredAt = addDays2(now, durationInDays);
      memberToUpdate = {
        user: owner,
        memberNo: randomSerialNumber(16),
        description: 'vip会员卡',
        type: 'vip',
        createdAt: now,
        updatedAt: now,
        expiredAt: expiredAt
      };
    } else {
      const { expiredAt } = member;
      let expiredAtToUpdate = now;
      if (expiredAt && date2moment(expiredAt).isAfter(now)) {
        expiredAtToUpdate = addDays2(date2moment(expiredAt), durationInDays);
      } else {
        expiredAtToUpdate = addDays2(now, durationInDays);
      }
      memberToUpdate = Object.assign(member.toObject(), {
        updatedAt: now,
        expiredAt: expiredAtToUpdate
      });
    }
    const newMember = await MembersRepo.saveOrUpdate(memberToUpdate, options);
    return newMember;
  }

  async redeemMemberCard(user: IUserModel, redeemCode: string): Promise<IMemberModel> {
    // const { id: userId, members } = user;
    const memberCard = await MemberCardsRepo.findByRedeemCode(redeemCode);
    if (!memberCard) {
      throw new ResourceNotFoundException('MemberCard', redeemCode);
    }
    const {
      id: memberCardId,
      status,
      owner,
      cardType: { durationInDays }
    } = memberCard;
    if (status !== 'active') {
      logger.error(`Invalid member card status to redeem, redeemCode: ${redeemCode}, ${status}`);
      throw new InvalidMemberCardException(memberCardId);
    }
    if (owner) {
      logger.error(`Card ${memberCardId} is already taken by others`);
      throw new InvalidMemberCardException(memberCardId);
    }

    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };
      const newMember = await this.subscribeMember(user, durationInDays, opts);
      // mark card to be used
      const memberCardToUpdate = Object.assign(memberCard, { status: 'used' });
      await MemberCardsRepo.saveOrUpdate(memberCardToUpdate, opts);
      await session.commitTransaction();
      await this.endSession();
      return newMember;
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      throw err;
    }
  }
}

export default new MemberService();
