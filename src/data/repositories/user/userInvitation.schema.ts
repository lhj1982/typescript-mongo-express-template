import { Schema } from 'mongoose';
import { IUserInvitationModel } from './userInvitation.model';

export const UserInvitationSchema: Schema<IUserInvitationModel> = new Schema(
  {
    invitor: { type: Schema.Types.ObjectId, ref: 'User' },
    inviteeMobile: {
      type: String,
      required: 'Invitee mobile number is required'
    },
    invitee: { type: Schema.Types.ObjectId, ref: 'User' },
    invitationCode: {
      type: String
    },
    type: {
      type: String,
      enum: ['event_user_invitation']
    },
    objectId: {
      type: String
    },
    expiredAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
