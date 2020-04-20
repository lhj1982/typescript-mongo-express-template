import { Schema } from 'mongoose';
import { IEventModel } from './event.model';
export const EventSchema: Schema<IEventModel> = new Schema(
  {
    script: { type: Schema.Types.ObjectId, ref: 'Script' },
    shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },
    type: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline'
    },
    hostUser: { type: Schema.Types.ObjectId, ref: 'User' },
    hostComment: {
      type: String
    },
    minNumberOfSpots: {
      //minPlayers
      type: Number
    },
    maxNumberOfSpots: {
      //maxPlayers
      type: Number
    },
    numberOfOfflinePlayers: {
      //offlinePlayers
      type: Number,
      default: 0
    },
    numberOfPlayers: {
      type: Number,
      default: 0
    },
    minNumberOfAvailableSpots: {
      type: Number,
      default: 0
    },
    maxNumberOfAvailableSpots: {
      type: Number,
      default: 0
    },
    price: Number,
    discountRule: {
      type: Schema.Types.ObjectId,
      ref: 'DiscountRule'
    },
    status: {
      type: String,
      enum: ['ready', 'completed', 'expired', 'cancelled'],
      default: 'ready'
    },
    supportPayment: {
      type: Boolean,
      default: false
    },
    isHostJoin: {
      type: Boolean,
      default: true
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

EventSchema.virtual('members', {
  ref: 'EventUser',
  localField: '_id',
  foreignField: 'event'
});
EventSchema.virtual('commissions', {
  ref: 'EventCommission',
  localField: '_id',
  foreignField: 'event'
});
