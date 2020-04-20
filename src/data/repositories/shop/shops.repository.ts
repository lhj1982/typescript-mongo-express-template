import { model } from 'mongoose';
import { IShopModel } from './shop.model';
import { ShopSchema } from './shop.schema';
import { escapeRegex } from '../../../utils/stringUtil';
const Shop = model<IShopModel>('Shop', ShopSchema);
// mongoose.set('useFindAndModify', false);

class ShopsRepo {
  async getAllCourses(options): Promise<IShopModel[]> {
    return await Shop.find(options);
  }

  async findById(id: string): Promise<IShopModel> {
    // console.log(mongoose.Types.ObjectId.isValid(id));
    return await Shop.findById(id)
      .populate('scripts')
      .exec();
  }

  async find(params): Promise<any> {
    const { offset, limit, keyword } = params;
    const total = await Shop.countDocuments({}).exec();
    const pagination = { offset, limit, total };
    let condition = {};
    if (keyword) {
      const regex = new RegExp(escapeRegex(keyword), 'gi');
      condition = { name: regex };
    }
    const pagedShops = await Shop.find(condition)
      .populate('scripts', ['_id', 'name', 'description', 'duration'])
      .skip(offset)
      .limit(limit)
      .exec();
    return { pagination, data: pagedShops };
  }

  async findOne(params): Promise<IShopModel> {
    return await Shop.where(params)
      .findOne()
      .exec();
  }

  async saveOrUpdate(shop): Promise<IShopModel> {
    const options = {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    return await Shop.findOneAndUpdate({ key: shop.key }, shop, options).exec();
  }
}
export default new ShopsRepo();
