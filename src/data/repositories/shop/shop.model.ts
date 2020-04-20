import { Document } from 'mongoose';
import { IScriptModel } from '../script/script.model';

interface IShop {
  name: string;
  key: string;
  address: string;
  description: string;
  brandingImage: string;
  mobiles: string[];
  phone: string;
  // userId: {
  //   type: String
  // },
  province: string;
  city: string;
  district: string;
  supportedPaymentMethods: string[];
  createdAt: Date;
}

export interface IShopModel extends IShop, Document {
  scripts: IScriptModel[];
  onlineScripts: IScriptModel[];
}
