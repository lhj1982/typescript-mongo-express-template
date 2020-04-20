import { Document } from 'mongoose';
import { IUserModel } from '../user/user.model';

interface IOrder {
  type: string;
  objectId: string;
  amount: number;
  outTradeNo: string;
  orderStatus: string;
  message: string;
  createdAt: Date;
  payment: any;
}

export interface IOrderModel extends IOrder, Document {
  createdBy?: IUserModel;
}
