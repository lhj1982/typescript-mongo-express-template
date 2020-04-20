import { model } from 'mongoose';

import { IMemberCardModel } from './memberCard.model';
import { MemberCardSchema } from './memberCard.schema';

const MemberCard = model<IMemberCardModel>('MemberCard', MemberCardSchema, 'memberCards');
// mongoose.set('useFindAndModify', false);

class MemberCardsRepo {
  async findById(id: string): Promise<IMemberCardModel> {
    return await MemberCard.findById(id)
      .populate('owner')
      .populate('cardType')
      .exec();
  }

  async findByRedeemCode(redeemCode: string): Promise<IMemberCardModel> {
    return await MemberCard.findOne({ redeemCode })
      .populate('owner')
      .populate('cardType')
      .exec();
  }

  async find(params: any): Promise<IMemberCardModel[]> {
    return await MemberCard.find(params)
      .populate('owner')
      .populate('cardType')
      .exec();
  }

  async saveOrUpdate(memberCard: any, opts = {}): Promise<IMemberCardModel> {
    const options = {
      ...opts,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { _id, cardNo } = memberCard;
    if (_id) {
      return await MemberCard.findOneAndUpdate({ _id }, memberCard, options).exec();
    } else {
      return await MemberCard.findOneAndUpdate({ cardNo }, memberCard, options).exec();
    }
  }
}

export default new MemberCardsRepo();
