import { IRoleModel } from '../../data/repositories/user/role.model';
import RolesRepo from '../../data/repositories/user/roles.repository';

class RoleService {
  async findByName(name: string): Promise<IRoleModel> {
    return await RolesRepo.findByName(name);
  }
}

export default new RoleService();
