import { Schema } from 'mongoose';
import { IDiscountRuleModel } from './discountRule.model';

export const DiscountRuleSchema: Schema<IDiscountRuleModel> = new Schema({
  key: { type: String },
  description: { type: String },
  timeDescription: { type: String },
  days: [{ type: String }],
  timeSpan: [
    {
      from: { type: String },
      to: { type: String }
    }
  ],
  discount: {
    host: { type: Number },
    invitor: { type: Number },
    participator: { type: Number }
  },
  // exception: {
  //   dates: [{ type: String }]
  // },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
