import { Document } from 'mongoose';
import { IShopModel } from '../shop/shop.model';
import { IScriptModel } from '../script/script.model';
import { IDiscountRuleModel } from '../discount-rule/discountRule.model';
import { IUserModel } from '../user/user.model';
import { IEventUserModel } from './eventUser.model';
interface IEvent {
  startTime: Date;
  endTime: Date;
  type: string;
  hostComment?: string;
  minNumberOfSpots?: number;
  maxNumberOfSpots?: number;
  numberOfOfflinePlayers: number;
  numberOfPlayers?: number;
  minNumberOfAvailableSpots?: number;
  maxNumberOfAvailableSpots?: number;
  price: number;
  status: string;
  isHostJoin: boolean;
  createdAt: Date;
  updatedAt: Date;
  supportPayment: boolean;
}

export interface IEventModel extends IEvent, Document {
  shop: IShopModel;
  script: IScriptModel;
  hostUser: IUserModel;
  members: IEventUserModel[];
  discountRule: IDiscountRuleModel;
}
