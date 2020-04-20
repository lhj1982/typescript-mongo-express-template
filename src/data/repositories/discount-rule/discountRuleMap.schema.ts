import { Schema } from 'mongoose';
import { IDiscountRuleMapModel } from './discountRuleMap.model';

export const DiscountRuleMapSchema: Schema<IDiscountRuleMapModel> = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    script: { type: Schema.Types.ObjectId, ref: 'Script' },
    discountRule: { type: Schema.Types.ObjectId, ref: 'DiscountRule' },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { toJSON: { virtuals: true } }
);
