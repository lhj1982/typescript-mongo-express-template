// import ScriptsRepo from '../../data/repositories/script/scripts.repository';
import ShopsRepo from '../../data/repositories/shop/shops.repository';
// import EventUsersRepo from '../../data/repositories/event/eventUsers.repository';
// import WatchListsRepo from '../../data/repositories/user/watchLists.repository';
// import { ResourceNotFoundException } from '../../exceptions/custom.exceptions';
// import { nowDate } from '../../utils/dateUtil';
import { IShopModel } from '../../data/repositories/shop/shop.model';

import { InvalidRequestException, ResourceAlreadyExistException } from '../../exceptions/custom.exceptions';

class ShopService {
  async findById(id: string): Promise<IShopModel> {
    return await ShopsRepo.findById(id);
  }

  async find(params: any): Promise<any> {
    return await ShopsRepo.find(params);
  }

  async addShop(shopData: any): Promise<IShopModel> {
    const { key } = shopData;
    if (!key) {
      throw new InvalidRequestException('AddShop', ['key']);
    }
    const shop = await ShopsRepo.findOne({ key });
    if (shop) {
      throw new ResourceAlreadyExistException(`Shop`, key);
    }
    const newShop = await ShopsRepo.saveOrUpdate(shop);
    return newShop;
  }

  async save(shop: IShopModel): Promise<IShopModel> {
    return await ShopsRepo.saveOrUpdate(shop);
  }
}

export default new ShopService();
