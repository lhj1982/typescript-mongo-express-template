import { Schema } from 'mongoose';

import { IShopScriptModel } from './shopScript.model';
import { IShopModel } from './shop.model';
import { IScriptModel } from '../script/script.model';

export const ShopScriptSchema: Schema<IShopScriptModel> = new Schema(
  {
    script: { type: Schema.Types.ObjectId, ref: 'Script' },
    shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    image: {
      type: String
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
