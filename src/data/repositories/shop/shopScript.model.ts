import { Document } from 'mongoose';
import { IScriptModel } from '../script/script.model';
import { IShopModel } from './shop.model';

interface IShopScript {
  image: string;
}

export interface IShopScriptModel extends IShopScript, Document {
  script: IScriptModel;
  shop: IShopModel;
}
