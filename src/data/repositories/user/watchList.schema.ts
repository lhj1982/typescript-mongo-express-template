import { Schema } from 'mongoose';

export const WatchListSchema: Schema<any> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['script_interested']
    },
    objectId: { type: 'string' },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
