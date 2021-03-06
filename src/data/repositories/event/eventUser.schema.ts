import { Schema } from 'mongoose';

export const EventUserSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: {
      type: String
    },
    source: {
      type: String
    },
    mobile: {
      type: String
    },
    wechatId: {
      type: String,
      required: 'Wechat id cannot be empty'
    },
    invitor: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    invitationCode: {
      type: String
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'cancelled', 'blacklisted'],
      default: 'unpaid'
    },
    statusNote: {
      type: String,
      enum: ['price_updated', 'event_cancelled', 'user_event_cancelled']
    },
    // numberOfEndorsements: {
    //   type: Number,
    //   default: 0
    // },
    // endorsements: [{ type: Schema.Types.ObjectId, ref: 'UserEndorsement' }],
    tags: [{ type: Schema.Types.ObjectId, ref: 'UserTag' }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// EventUserSchema.virtual('tags', {
//   ref: 'UserTag',
//   localField: '_id',
//   foreignField: 'tags'
// });
