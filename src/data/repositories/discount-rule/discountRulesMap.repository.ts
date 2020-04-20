import { model } from 'mongoose';
import { IDiscountRuleMapModel } from './discountRuleMap.model';
// import { DiscountRuleSchema } from './discountRule.schema';
import { IShopModel } from '../shop/shop.model';
import { IScriptModel } from '../script/script.model';
import { DiscountRuleMapSchema } from './discountRuleMap.schema';
import { getDay, getTime } from '../../../utils/dateUtil';

// const DiscountRule = mongoose.model('DiscountRule', DiscountRuleSchema, 'discountRules');
const DiscountRuleMap = model<IDiscountRuleMapModel>('DiscountRuleMap', DiscountRuleMapSchema, 'discountRulesMap');
// mongoose.set('useFindAndModify', false);

class DiscountRulesMapRepo {
  async findByShopAndScript(shop: IShopModel, script: IScriptModel, startTime: string): Promise<IDiscountRuleMapModel[]> {
    const condition = {};
    if (script) {
      condition['script'] = script;
    }
    if (shop) {
      condition['shop'] = shop;
    }
    const discountRuleCondition = {};
    if (startTime) {
      const weekDay = getDay(startTime);
      const time = getTime(startTime);
      console.log(startTime);
      console.log(weekDay);
      console.log(time);
      {
        days: {
          all: [weekDay];
        }
      }
      discountRuleCondition['days'] = { $all: [weekDay] };
      discountRuleCondition['timeSpan'] = {
        $elemMatch: { from: { $lte: time }, to: { $gte: time } }
      };
    }
    // console.log(discountRuleCondition);
    return await DiscountRuleMap.find(condition)
      .populate('script', ['_id', 'key', 'name'])
      .populate('shop', ['_id', 'key', 'name'])
      // .populate('discountRule', ['key', 'description', 'timeDescription', 'days', 'timeSpan', 'discount'])
      .populate({
        path: 'discountRule',
        match: discountRuleCondition
      })
      .exec();
  }

  async saveOrUpdate(discountRuleMapObj): Promise<IDiscountRuleMapModel> {
    // const { key } = discountRuleMapObj;
    const options = {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    return await DiscountRuleMap.findOneAndUpdate({}, discountRuleMapObj, options).exec();
  }
}

export default new DiscountRulesMapRepo();
