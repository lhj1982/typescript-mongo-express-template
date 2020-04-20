import { model } from 'mongoose';
import { IShopModel } from '../shop/shop.model';
import { IScriptModel } from '../script/script.model';
import { IPriceWeeklySchemaModel } from './priceWeeklySchema.model';
import { IDiscountRuleModel } from '../discount-rule/discountRule.model';
import { PriceWeeklySchemaSchema } from './priceWeeklySchema.schema';
import { DiscountRuleSchema } from '../discount-rule/discountRule.schema';

const PriceWeeklySchema = model<IPriceWeeklySchemaModel>('PriceWeeklySchema', PriceWeeklySchemaSchema, 'priceWeeklySchema');
const DiscountRule = model<IDiscountRuleModel>('DiscountRule', DiscountRuleSchema, 'discountRules');
// mongoose.set('useFindAndModify', false);

class PricesRepo {
  async findByShopAndScript(shop: IShopModel, script: IScriptModel): Promise<IPriceWeeklySchemaModel> {
    return await PriceWeeklySchema.find({ shop, script })
      .findOne()
      .exec();
  }

  async findDiscountRules(): Promise<IDiscountRuleModel[]> {
    return await DiscountRule.find().exec();
  }

  async saveOrUpdatePriceSchema(priceSchemaObj: any): Promise<IPriceWeeklySchemaModel> {
    const { script, shop } = priceSchemaObj;
    const options = {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    return await PriceWeeklySchema.findOneAndUpdate({ shop, script }, priceSchemaObj, options).exec();
  }

  async saveOrUpdateDiscountRule(discountRuleObj: any): Promise<IDiscountRuleModel> {
    // const { key } = discountRuleObj;
    const options = {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    return await DiscountRule.findOneAndUpdate(discountRuleObj, discountRuleObj, options).exec();
  }
}

export default new PricesRepo();
