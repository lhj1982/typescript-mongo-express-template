import { Schema } from 'mongoose';
import { IGamePlayerModel } from './gamePlayer.model';

export const GamePlayerSchema: Schema<IGamePlayerModel> = new Schema(
  {
    game: { type: Schema.Types.ObjectId, ref: 'Game' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    playerId: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
