import { Document } from 'mongoose';
import { IScriptModel } from './script.model';

interface IScriptClue {
  title: string;
  content: string;
  round: string;
  about: string;
  public: boolean;
  images: string[];
}

export interface IScriptClueModel extends IScriptClue, Document {
  script: IScriptModel;
}
