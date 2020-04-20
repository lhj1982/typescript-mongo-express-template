import { Document } from 'mongoose';
import { IUserModel } from './user.model';

interface IUserInvitation {
  inviteeMobile: string;
  invitationCode: string;
  objectId?: string;
  type: string;
  expiredAt: Date;
  createdAt: Date;
}

export interface IUserInvitationModel extends IUserInvitation, Document {
  invitor: IUserModel;
  invitee: IUserModel;
}
