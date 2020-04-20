import { Schema } from 'mongoose';
import { IShopStaffModel } from './shopStaff.model';

export const ShopStaffSchema: Schema<IShopStaffModel> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    role: {
      type: String,
      enum: ['employee', 'dungeon-master'],
      default: 'employee'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
