import { Document } from 'mongoose';
import { IScriptRundownModel } from './scriptRundown.model';
import { IScriptClueFilterModel } from './scriptClueFilter.model';
import { IScriptClueModel } from './scriptClue.model';
import { IShopModel } from '../shop/shop.model';
import { IEventModel } from '../event/event.model';
import { IDiscountRuleMapModel } from '../discount-rule/discountRuleMap.model';

interface IScript {
  name: string;
  key: string;
  description?: string;
  // permissions?: string[];
  minNumberOfSpots: number;
  maxNumberOfSpots: number;
  duration: number;
  coverImage?: string;
  minPrice: number;
}

export interface IScriptModel extends IScript, Document {
  shops: IShopModel[];
  events: IEventModel[];
  discountRuleMap: IDiscountRuleMapModel[];
  rundowns: IScriptRundownModel[];
  clueFilters: IScriptClueFilterModel[];
  clues: IScriptClueModel[];
}
