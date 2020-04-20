import { Document } from 'mongoose';
import { IScriptModel } from './script.model';

interface IScriptClueFilter {
  script: IScriptModel;
  key: string;
  title: string;
  field: string;
  value: string;
}

export interface IScriptClueFilterModel extends IScriptClueFilter, Document {}
