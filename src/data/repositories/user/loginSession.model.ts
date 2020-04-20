import { Document } from 'mongoose';

interface ILoginSession {
  appId: string;
  code: string;
  openId: string;
  unionId: string;
  sessionKey: string;
  statusCode: string;
  errorMsg: string;
  createdAt: Date;
}

export interface ILoginSessionModel extends ILoginSession, Document {}
