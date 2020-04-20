import { Schema } from 'mongoose';
import { IGameScriptClueModel } from './gameScriptClue.model';

export const GameScriptClueSchema: Schema<IGameScriptClueModel> = new Schema(
  {
    game: { type: Schema.Types.ObjectId, ref: 'Game' },
    scriptClue: { type: Schema.Types.ObjectId, ref: 'ScriptClue' },
    owner: {
      type: String
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    hasRead: {
      type: Boolean,
      default: false
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
