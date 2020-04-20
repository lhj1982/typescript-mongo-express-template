import { Document } from 'mongoose';
import { IUserModel } from '../user/user.model';
import { IMemberLevelModel } from './memberLevel.model';

interface IMember {
  memberNo: string;
  invitationCode?: string;
  description?: string;
  type: string;
  createdAt: Date;
  updatedAt?: Date;
  expiredAt?: Date;
}

export interface IMemberModel extends IMember, Document {
  user?: IUserModel;
  level: IMemberLevelModel;
}
