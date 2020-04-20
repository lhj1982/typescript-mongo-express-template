import { Document } from 'mongoose';
import { IUserModel } from '../user/user.model';
import { ITagModel } from './tag.model';

interface IUserTag {
  type: string;
  objectId: string;
  createdAt?: Date;
}

export interface IUserTagModel extends IUserTag, Document {
  user: IUserModel;
  tag: ITagModel;
  taggedBy: IUserModel;
}
