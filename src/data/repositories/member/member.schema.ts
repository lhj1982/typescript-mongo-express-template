import { Schema } from 'mongoose';

export const MemberSchema: Schema = new Schema(
  {
    memberNo: {
      type: String,
      minlength: 12,
      maxlength: 16,
      required: true
    },
    description: {
      type: String
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['vip'],
      default: 'vip'
    },
    level: { type: Schema.Types.ObjectId, ref: 'MemberLevel' },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    expiredAt: {
      type: Date
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
