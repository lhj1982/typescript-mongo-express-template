import { Schema } from 'mongoose';
import { IUserTagModel } from './userTag.model';

export const UserTagSchema: Schema<IUserTagModel> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    tag: { type: Schema.Types.ObjectId, ref: 'Tag' },
    type: {
      type: String,
      enum: ['event_user']
    },
    objectId: {
      type: String
    },
    taggedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
