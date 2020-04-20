import { model } from 'mongoose';
import { IDiscountRuleModel } from './discountRule.model';
import { DiscountRuleSchema } from './discountRule.schema';

const DiscountRule = model<IDiscountRuleModel>('DiscountRule', DiscountRuleSchema, 'discountRules');

class DiscountRulesRepo {
  async findByKey(key: string): Promise<IDiscountRuleModel> {
    return await DiscountRule.find({ key })
      .findOne()
      .exec();
  }
}

export default new DiscountRulesRepo();
