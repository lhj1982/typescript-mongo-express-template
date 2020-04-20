import { Document } from 'mongoose';
import { IShopModel } from '../shop/shop.model';
import { IScriptModel } from '../script/script.model';
import { IDiscountRuleModel } from './discountRule.model';

interface IDiscountRuleMap {
  createdAt: Date;
}

export interface IDiscountRuleMapModel extends IDiscountRuleMap, Document {
  shop: IShopModel;
  script: IScriptModel;
  discountRule: IDiscountRuleModel;
}
