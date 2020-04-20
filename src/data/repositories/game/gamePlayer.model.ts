import { Document } from 'mongoose';
import { IUserModel } from '../user/user.model';
import { IGameModel } from './game.model';

interface IGamePlayer {
  playerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGamePlayerModel extends IGamePlayer, Document {
  game: IGameModel;
  user: IUserModel;
}
