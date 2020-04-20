// import logger from '../../middleware/logger.middleware';
import { IUserModel } from '../../data/repositories/user/user.model';
import { IEventModel } from '../../data/repositories/event/event.model';
import { IEventUserModel } from '../../data/repositories/event/eventUser.model';

import GenericService from './generic.service';

import EventUsersRepo from '../../data/repositories/event/eventUsers.repository';

class EventUserService extends GenericService {
  async findEventUser(event: IEventModel, user: IUserModel): Promise<IEventUserModel> {
    return await EventUsersRepo.findEventUser(event, user);
  }

  async update(eventUser: IEventUserModel): Promise<IEventUserModel> {
    return await EventUsersRepo.saveOrUpdate(eventUser);
  }
}

export default new EventUserService();
