import ScriptsRepo from '../repositories/scripts.repository';
import { ResourceNotFoundException } from '../exceptions/custom.exceptions';
import { nowDate } from '../utils/dateUtil';

class ScriptService {
  async findById(scriptId: string): Promise<any> {
    const script = await ScriptsRepo.findById(scriptId);
    if (!script) {
      throw new ResourceNotFoundException(`Script`, scriptId);
    }

    return Object.assign({}, script.toObject());
  }
}

export default new ScriptService();
