import { Request, Response, NextFunction } from 'express';
import AuthApi from '../api/auth';
import { InvalidRequestException, ResourceAlreadyExist, ResourceNotFoundException, AccessDeniedException } from '../exceptions/custom.exceptions';
import UsersRepo from '../repositories/users.repository';
import UserService from '../services/user.service';
import * as _ from 'lodash';

export class UsersController {
  getUsers = async (req: Request, res: Response) => {
    try {
      const contact = await UsersRepo.find({});
      res.json(contact);
    } catch (err) {
      res.send(err);
    }
  };

  sendInvitation = (req: Request, res: Response) => {
    const { openId } = req.body;
  };

  getAccessToken = async (req: Request, res: Response) => {
    const response = await AuthApi.getAccessToken();
    // UserRepo.saveAccessToken();
    res.json(response);
    // return response;
  };

  getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { loggedInUser } = res.locals;
    if (userId && userId != loggedInUser.id) {
      next(new AccessDeniedException(userId, 'You can only show your own profile'));
    }
    res.json({ code: 'SUCCESS', data: loggedInUser });
  };
}
