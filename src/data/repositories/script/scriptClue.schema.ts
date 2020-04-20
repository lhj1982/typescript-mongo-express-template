import { Schema } from 'mongoose';
import { IScriptClueModel } from './scriptClue.model';

export const ScriptClueSchema: Schema<IScriptClueModel> = new Schema(
  {
    script: { type: Schema.Types.ObjectId, ref: 'Script' },
    title: {
      type: String
    },
    content: {
      type: String
    },
    round: {
      type: String
    },
    about: {
      type: String
    },
    public: {
      type: Boolean,
      default: false
    },
    images: [
      {
        type: String
      }
    ]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
