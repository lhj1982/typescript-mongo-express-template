import { Schema } from 'mongoose';
import { IEventCommissionModel } from './eventCommission.model';
export const EventCommissionSchema: Schema<IEventCommissionModel> = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event' },
    commissions: {
      host: {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        amount: Number
      },
      invitors: [
        {
          eventUser: { type: Schema.Types.ObjectId, ref: 'EventUser' },
          user: { type: Schema.Types.ObjectId, ref: 'User' },
          amount: Number,
          actualAmount: Number
        }
      ],
      participators: [
        {
          eventUser: { type: Schema.Types.ObjectId, ref: 'EventUser' },
          user: { type: Schema.Types.ObjectId, ref: 'User' },
          amount: Number,
          actualAmount: Number
        }
      ]
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
