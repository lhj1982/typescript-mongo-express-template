import { Document } from 'mongoose';
import { IScriptModel } from './script.model';

interface IScriptRundown {
  playerId: string;
  name: string;
  description: string;
  rundown: IRundDown[];
}

interface IRundDown {
  title: string;
  content: string;
}

export interface IScriptRundownModel extends IScriptRundown, Document {
  script: IScriptModel;
}
