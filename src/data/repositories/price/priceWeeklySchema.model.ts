import { Document } from 'mongoose';
import { IScriptModel } from '../script/script.model';
import { IShopModel } from '../shop/shop.model';

interface IPriceWeeklySchema {
  priceSchema: {
    days: [{ type: number }];
    timeSpan: [{ type: string }];
    price: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IPriceWeeklySchemaModel extends IPriceWeeklySchema, Document {
  script?: IScriptModel;
  shop?: IShopModel;
}
