import { Schema } from 'mongoose';
export const MemberLevelSchema: Schema = new Schema(
  {
    level: {
      type: String,
      enum: ['1', '2'],
      default: '1'
    },
    key: {
      type: String
    },
    description: {
      type: String
    },
    benefits: [
      {
        fullCommission: {
          type: Number
        }
      }
    ]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
