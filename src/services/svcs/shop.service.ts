// import ScriptsRepo from '../../data/repositories/script/scripts.repository';
import ShopsRepo from '../../data/repositories/shop/shops.repository';
// import EventUsersRepo from '../../data/repositories/event/eventUsers.repository';
// import WatchListsRepo from '../../data/repositories/user/watchLists.repository';
// import { ResourceNotFoundException } from '../../exceptions/custom.exceptions';
// import { nowDate } from '../../utils/dateUtil';
import { IShopModel } from '../../data/repositories/shop/shop.model';

class ShopService {
  async findById(id: string): Promise<IShopModel> {
    return await ShopsRepo.findById(id);
  }
}

export default new ShopService();
