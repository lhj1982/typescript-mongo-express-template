import { Document } from 'mongoose';

interface IDiscountRule {
  key: string;
  description: string;
  timeDescription: string;
  days: string[];
  timeSpan: [
    {
      from: string;
      to: string;
    }
  ];
  discount: {
    host: number;
    invitor: number;
    participator: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IDiscountRuleModel extends IDiscountRule, Document {}
