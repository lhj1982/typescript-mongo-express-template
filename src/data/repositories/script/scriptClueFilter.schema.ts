import { Schema } from 'mongoose';
import { IScriptClueFilterModel } from './scriptClueFilter.model';

export const ScriptClueFilterSchema: Schema<IScriptClueFilterModel> = new Schema(
  {
    script: { type: Schema.Types.ObjectId, ref: 'Script' },
    key: {
      type: String
    },
    title: {
      type: String
    },
    field: {
      type: String
    },
    value: {
      type: String
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
