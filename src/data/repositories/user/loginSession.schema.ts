import { Schema } from 'mongoose';
import { ILoginSessionModel } from './loginSession.model';

export const LoginSessionSchema: Schema<ILoginSessionModel> = new Schema(
  {
    appId: {
      type: String
    },
    code: {
      type: String
    },
    openId: { type: String },
    unionId: { type: String },
    sessionKey: { type: String },
    statusCode: {
      type: String
    },
    errorMsg: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
