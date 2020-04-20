import { Document } from 'mongoose';
import { IScriptClueModel } from '../script/scriptClue.model';
import { IGameModel } from './game.model';

interface IGameScriptClue {
  owner: string;
  isPublic: boolean;
  hasRead: boolean;
}

export interface IGameScriptClueModel extends IGameScriptClue, Document {
  game?: IGameModel;
  scriptClue: IScriptClueModel;
}
