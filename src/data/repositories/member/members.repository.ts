import { model } from 'mongoose';

import { IUserModel } from '../user/user.model';
import { IMemberModel } from './member.model';
import { MemberSchema } from './member.schema';

const Member = model<IMemberModel>('Member', MemberSchema, 'members');
// mongoose.set('useFindAndModify', false);

class MembersRepo {
  async findByUser(user: IUserModel): Promise<IMemberModel> {
    return Member.findOne({ user })
      .populate('level')
      .populate('user')
      .exec();
  }

  async saveOrUpdate(member: any, opts = {}): Promise<IMemberModel> {
    const options = {
      ...opts,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { _id, memberNo } = member;
    if (_id) {
      return await Member.findOneAndUpdate({ _id }, member, options).exec();
    } else {
      return await Member.findOneAndUpdate({ memberNo }, member, options).exec();
    }
  }
}

export default new MembersRepo();
