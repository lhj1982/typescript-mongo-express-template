import { Document } from 'mongoose';

interface IMemberLevel {
  level: string;
  key: string;
  description: string;
  benefits: [
    {
      fullCommission: number;
    }
  ];
}

export interface IMemberLevelModel extends IMemberLevel, Document {}
