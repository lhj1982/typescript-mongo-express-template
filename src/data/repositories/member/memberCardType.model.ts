import { Document } from 'mongoose';

interface IMemberCardType {
  key: string;
  name?: string;
  description?: string;
  durationInDays: number;
  price: number;
  discountPrice: number;
}

export interface IMemberCardTypeModel extends IMemberCardType, Document {}
