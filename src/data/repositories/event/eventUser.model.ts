import { Document } from 'mongoose';
import { IEventModel } from './event.model';
import { IUserModel } from '../user/user.model';
import { IUserTagModel } from '../tag/userTag.model';
interface IEventUser {
  userName: string;
  source: string;
  mobile?: string;
  wechatId?: string;
  status: string;
  statusNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventUserModel extends IEventUser, Document {
  event: IEventModel;
  user: IUserModel;
  invitor: IUserModel;
  invitationCode: string;
  tags: IUserTagModel[];
}
