import { model } from 'mongoose';
import { IUserInvitationModel } from './userInvitation.model';
import { UserInvitationSchema } from './userInvitation.schema';
const UserInvitation = model<IUserInvitationModel>('UserInvitation', UserInvitationSchema, 'userInvitations');
// mongoose.set('useFindAndModify', false);
import { nowDate } from '../../../utils/dateUtil';

class UserInvitationsRepo {
  async findByCode(code: string): Promise<IUserInvitationModel> {
    return await UserInvitation.findOne({
      invitationCode: code,
      expiredAt: { $gt: nowDate().toDate() }
    }).exec();
  }

  async addNew(userInvitation, opt: object = {}): Promise<IUserInvitationModel> {
    const options = {
      ...opt,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const obj = new UserInvitation(userInvitation);
    return await obj.save();
  }
}

export default new UserInvitationsRepo();
