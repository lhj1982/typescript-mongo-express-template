import { Model, model } from 'mongoose';
import { IRoleModel } from './role.model';
import { RoleSchema } from './role.schema';

const Role: Model<IRoleModel> = model<IRoleModel>('Role', RoleSchema);
// mongoose.set('useFindAndModify', false);

class RolesRepo {
  async findById(id: string): Promise<IRoleModel> {
    // console.log('script ' + mongoose.Types.ObjectId.isValid(id));
    return await Role.findById(id).exec();
  }

  async findByName(name: string): Promise<IRoleModel> {
    // console.log('script ' + mongoose.Types.ObjectId.isValid(id));
    return await Role.find({ name: name })
      .findOne()
      .exec();
  }
}
export default new RolesRepo();
