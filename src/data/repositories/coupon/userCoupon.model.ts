import { Document } from 'mongoose';
import { IEventUserModel } from '../event/eventUser.model';
import { IUserModel } from '../user/user.model';
interface IUserCoupon {
  type: string;
  objectId?: string;
  booking?: IEventUserModel;
  amount: number;
  description: string;
  status: string;
  expiredAt: Date;
  redeemedAt: Date;
  createdAt: Date;
}

export interface IUserCouponModel extends IUserCoupon, Document {
  owner: IUserModel;
}
