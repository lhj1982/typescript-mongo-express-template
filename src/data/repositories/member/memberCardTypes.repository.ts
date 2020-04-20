import { model } from 'mongoose';

import { IMemberCardTypeModel } from './memberCardType.model';
import { MemberCardTypeSchema } from './memberCardType.schema';

const MemberCardType = model<IMemberCardTypeModel>('MemberCardType', MemberCardTypeSchema, 'memberCardTypes');
// mongoose.set('useFindAndModify', false);

class MemberCardTypesRepo {
  async findById(id: string): Promise<IMemberCardTypeModel> {
    return await MemberCardType.findById(id).exec();
  }

  async find(params: any): Promise<IMemberCardTypeModel[]> {
    return await MemberCardType.find(params)
      .sort({ key: 1 })
      .exec();
  }
}

export default new MemberCardTypesRepo();
