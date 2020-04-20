import { Schema } from 'mongoose';
import { IScriptModel } from './script.model';
export const ScriptSchema: Schema<IScriptModel> = new Schema(
  {
    name: {
      type: String
    },
    key: {
      type: String
    },
    type: [
      {
        type: String,
        enum: ['online', 'offline']
      }
    ],
    description: {
      type: String
    },
    minNumberOfSpots: {
      type: Number
    },
    maxNumberOfSpots: {
      type: Number
    },
    duration: {
      type: Number
    },
    coverImage: {
      type: String
    },
    minPrice: {
      type: Number
    },
    status: {
      type: String,
      enum: ['offline', 'online'],
      default: 'offline'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tags: [String]
    // shops: [{ type: String, ref: 'Shop' }]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ScriptSchema.virtual('rundowns', {
  ref: 'ScriptRundown',
  localField: '_id',
  foreignField: 'script'
});

ScriptSchema.virtual('clueFilters', {
  ref: 'ScriptClueFilter',
  localField: '_id',
  foreignField: 'script'
});

ScriptSchema.virtual('clues', {
  ref: 'ScriptClue',
  localField: '_id',
  foreignField: 'script'
});

ScriptSchema.virtual('shops', {
  ref: 'Shop',
  localField: '_id',
  foreignField: 'scripts'
});

ScriptSchema.virtual('discountRuleMap', {
  ref: 'DiscountRuleMap',
  localField: '_id',
  foreignField: 'script'
});

ScriptSchema.virtual('events', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'script'
});
