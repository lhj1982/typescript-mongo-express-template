import { Schema } from 'mongoose';
export const MemberCardTypeSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: 'Member card type key is required!'
    },
    name: {
      type: String
    },
    description: {
      type: String
    },
    durationInDays: {
      type: Number,
      required: 'Duration is required'
    },
    price: {
      type: Number
    },
    discountPrice: {
      type: Number
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
