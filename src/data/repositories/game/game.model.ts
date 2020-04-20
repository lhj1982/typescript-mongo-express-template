import { Document } from 'mongoose';
import { IScriptModel } from '../script/script.model';
import { IShopModel } from '../shop/shop.model';
import { IUserModel } from '../user/user.model';
import { IGamePlayerModel } from './gamePlayer.model';
import { IGameScriptClueModel } from './gameScriptClue.model';

interface IGame {
  startTime: Date;
  endTime: Date;
  hostUserMobile: string;
  hostUserWechatId: string;
  hostComment: string;
  numberOfPersons: number;
  roomId: string;
  code: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGameModel extends IGame, Document {
  shop: IShopModel;
  script: IScriptModel;
  hostUser: IUserModel;
  players: IGamePlayerModel[];
  scriptClues: IGameScriptClueModel[];
}
