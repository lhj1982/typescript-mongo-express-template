import { ITagModel } from '../../data/repositories/tag/tag.model';
import TagsRepo from '../../data/repositories/tag/tags.repository';

class TagService {
  async findById(id: string): Promise<ITagModel> {
    return await TagsRepo.findById(id);
  }
  async getTags(): Promise<ITagModel[]> {
    return await TagsRepo.find({});
  }
}

export default new TagService();
