import { Document } from 'mongoose';
import { IRoleModel } from './role.model';
import { IShopModel } from '../shop/shop.model';
import { IShopStaffModel } from '../shop/shopStaff.model';
interface IUser {
  openId: string;
  unionId: string;
  sessionKey: string;
  nickName: string;
  username: string;
  password: string;
  description: string;
  avatarUrl: string;
  province: string;
  city: string;
  country: string;
  language: string;
  email: string;
  company: string;
  phone: string;
  mobile: string;
  mobileCountryCode: string;
  contactMobile: string;
  age: number;
  ageTag: string;
  gender: string;
  birthday: string;
  wechatId: string;
  accessToken?: string;
  expiredAt?: Date;
  createdAt: Date;
  status: string;
  gameLevel?: number;
  topTags?: [
    {
      _id: {
        type: string;
      };
      name: {
        type: string;
      };
      count: {
        type: number;
      };
    }
  ];
}

export interface IUserModel extends IUser, Document {
  tokenExpiredAt?: string;
  tokenIssuedAt?: string;
  shopStaffs?: any[];
  members?: any[];
  coupons?: any[];
  roles: IRoleModel[];
  employers?: IShopStaffModel[];
  dmShop?: IShopModel;
}
