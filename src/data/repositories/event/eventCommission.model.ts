import { Document } from 'mongoose';
import { IUserModel } from '../user/user.model';
import { IEventModel } from './event.model';
import { IEventUserModel } from './eventUser.model';
interface IEventCommission {
  createdAt: Date;
}

export interface IEventCommissionModel extends IEventCommission, Document {
  event: IEventModel;
  commissions: {
    host?: { user: IUserModel; amount: number };
    invitors?: [{ eventUser: IEventUserModel; user: IUserModel; amount: number }];
    participators: [{ eventUser: IEventUserModel; user: IUserModel; amount: number }];
  };
}
