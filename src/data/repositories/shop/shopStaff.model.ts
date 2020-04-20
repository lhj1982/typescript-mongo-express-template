import { Document } from 'mongoose';
import { IShopModel } from './shop.model';
import { IUserModel } from '../user/user.model';
interface IShopStaff {
  role: string;
  createdAt: Date;
}

export interface IShopStaffModel extends IShopStaff, Document {
  shop: IShopModel;
  user: IUserModel;
}
