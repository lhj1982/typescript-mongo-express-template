import { Schema } from 'mongoose';
import { IPriceWeeklySchemaModel } from './priceWeeklySchema.model';

export const PriceWeeklySchemaSchema: Schema<IPriceWeeklySchemaModel> = new Schema(
  {
    script: { type: Schema.Types.ObjectId, ref: 'Script' },
    shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    priceSchema: {
      days: [{ type: Number }],
      timeSpan: [{ type: String }],
      price: Number
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { toJSON: { virtuals: true } }
);
