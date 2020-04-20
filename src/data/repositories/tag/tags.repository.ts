import { model } from 'mongoose';
import { ITagModel } from './tag.model';

import { TagSchema } from './tag.schema';
const Tag = model<ITagModel>('Tag', TagSchema);
// mongoose.set('useFindAndModify', false);

class TagsRepo {
  async find(params): Promise<ITagModel[]> {
    return await Tag.find(params).exec();
  }

  async findById(id: string): Promise<ITagModel> {
    // console.log('script ' + mongoose.Types.ObjectId.isValid(id));
    return await Tag.findById(id).exec();
  }

  async findByName(name: string): Promise<ITagModel> {
    return await Tag.find({ name: name })
      .findOne()
      .exec();
  }
}
export default new TagsRepo();
