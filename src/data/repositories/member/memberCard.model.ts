import { Document } from 'mongoose';
import { IUserModel } from '../user/user.model';
import { IMemberCardTypeModel } from './memberCardType.model';

interface IMemberCard {
  owner?: IUserModel; // if owner is empty, it means the card is created but not redeemed by anyone yet.
  cardNo: string;
  cardType: IMemberCardTypeModel;
  description?: string;
  redeemCode?: string;
  status: string;
  createdAt?: Date;
}

export interface IMemberCardModel extends IMemberCard, Document {}
