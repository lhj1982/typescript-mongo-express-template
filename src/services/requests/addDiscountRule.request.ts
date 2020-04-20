export interface IAddDiscountRuleRequest {
  key: string;
  description: string;
  timeDescription: string;
  timeSpan: string;
  days: string[];
  discount: {
    host: number;
    participator: number;
    invitor: number;
  };
}
