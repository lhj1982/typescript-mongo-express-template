import { Schema } from 'mongoose';
import { ITagModel } from './tag.model';

export const TagSchema: Schema<ITagModel> = new Schema(
  {
    key: {
      type: String,
      required: 'Tag key is required.'
    },
    name: {
      type: String,
      required: 'Tag name is required.'
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
