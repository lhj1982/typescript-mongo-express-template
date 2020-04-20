import { Document } from 'mongoose';
import { IUserModel } from './user.model';
interface IWatchList {
  type: string;
  objectId: string;
  createdAt: Date;
}

export interface IWatchListModel extends IWatchList, Document {
  user: IUserModel;
}
