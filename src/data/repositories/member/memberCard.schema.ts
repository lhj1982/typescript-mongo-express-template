import { Schema } from 'mongoose';
export const MemberCardSchema: Schema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    cardNo: {
      type: String,
      minlength: 12,
      maxlength: 16,
      required: 'Card no is required'
    },
    cardType: { type: Schema.Types.ObjectId, ref: 'MemberCardType' },
    description: {
      type: String
    },
    redeemCode: {
      type: String,
      minlength: 12,
      maxLength: 16
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'used', 'invalid'], // if a user has used the card, status is 'used', if the card can be redeemed, the status changed from 'created' to 'used'
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
