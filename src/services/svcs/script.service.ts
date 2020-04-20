import { IScriptModel } from '../../data/repositories/script/script.model';
import ScriptsRepo from '../../data/repositories/script/scripts.repository';
import EventUsersRepo from '../../data/repositories/event/eventUsers.repository';
import WatchListsRepo from '../../data/repositories/user/watchLists.repository';
import DiscountRulesRepo from '../../data/repositories/discount-rule/discountRules.repository';
import { ResourceNotFoundException, ResourceAlreadyExistException } from '../../exceptions/custom.exceptions';
import { nowDate } from '../../utils/dateUtil';

class ScriptService {
  async findById(scriptId: string, fetchExtended = false): Promise<any> {
    let script;
    if (fetchExtended) {
      script = await ScriptsRepo.findById(scriptId, true);
    } else {
      script = await ScriptsRepo.findById(scriptId);
    }
    if (!script) {
      throw new ResourceNotFoundException(`Script`, scriptId);
    }
    const eventUsers = await EventUsersRepo.findByScript(scriptId);
    const users = eventUsers.map(_ => {
      const {
        user: { _id, nickName, avatarUrl }
      } = _;
      return { _id, id: _id, nickName, avatarUrl };
    });
    const watchList = await WatchListsRepo.find({
      objectId: scriptId,
      type: 'script_interested'
    });
    const watches = watchList.map(_ => {
      const {
        userObj: { _id, id, avatarUrl, nickName }
      } = _;
      return { _id, id, avatarUrl, nickName };
    });
    return Object.assign({}, script.toObject(), { users }, { watches });
  }

  async find(params: { keyword?: string; offset?: number; limit?: number }): Promise<any> {
    return await ScriptsRepo.find(params);
  }

  async addToWatchList(scriptId: string, user): Promise<any> {
    const script = await ScriptsRepo.findById(scriptId);
    if (!script) {
      throw new ResourceNotFoundException('Script', scriptId);
    }
    const watchListToAdd = {
      type: 'script_interested',
      objectId: scriptId,
      user: user._id,
      createdAt: nowDate()
    };
    return await WatchListsRepo.saveOrUpdate(watchListToAdd);
  }

  async removeFromWatchList(scriptId: string, user): Promise<any> {
    const script = await ScriptsRepo.findById(scriptId);
    if (!script) {
      throw new ResourceNotFoundException('Script', scriptId);
    }
    const watchListToDelete = {
      type: 'script_interested',
      objectId: scriptId,
      user: user._id
    };
    return await WatchListsRepo.delete(watchListToDelete);
  }

  async findScriptsByDiscountKeys(discountKey: string, limit: number): Promise<any[]> {
    const discountRules = [];
    try {
      const discountKeys = discountKey.split(',');
      for (let i = 0; i < discountKeys.length; i++) {
        const discountRule = await DiscountRulesRepo.findByKey(discountKeys[i]);
        if (discountRule) {
          discountRules.push(discountRule);
        }
      }

      if (!limit) {
        limit = 6;
      }
      const allScripts = await ScriptsRepo.findByDiscountRules(discountRules);
      // console.log(allScripts.length);
      const scripts = this.getRandomScripts(allScripts, limit);
      return scripts;
    } catch (err) {
      throw err;
    }
  }

  getRandomScripts = (allScripts: IScriptModel[], limit: number): IScriptModel[] => {
    if (allScripts.length <= limit) {
      return allScripts;
    }
    return this.getRandomSubarray(allScripts, limit);
  };

  getRandomSubarray = (arr: IScriptModel[], size: number): IScriptModel[] => {
    const shuffled = arr.slice(0);
    let i = arr.length,
      temp,
      index;
    while (i--) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
  };

  async addScript(scriptToAdd: any): Promise<IScriptModel> {
    const { key } = scriptToAdd;
    const script = await ScriptsRepo.findOne({ key });
    // console.log(script);
    if (script) {
      throw new ResourceAlreadyExistException(`Script`, key);
    }
    const newScript = await ScriptsRepo.saveOrUpdate(scriptToAdd);
    return newScript;
  }
}

export default new ScriptService();
