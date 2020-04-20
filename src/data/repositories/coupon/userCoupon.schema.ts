import { Schema } from 'mongoose';
import { IUserCouponModel } from './userCoupon.model';

export const UserCouponSchema: Schema<IUserCouponModel> = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['commission_refund']
    },
    objectId: {
      type: String // eventUser id
    },
    amount: {
      type: Number
    },
    description: {
      type: String
    },
    status: {
      type: String,
      enum: ['created', 'active', 'redeemed', 'refund', 'deleted'], // cannot redeemed until status is active
      default: 'created'
    },
    expiredAt: {
      type: Date
    },
    redeemedAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
