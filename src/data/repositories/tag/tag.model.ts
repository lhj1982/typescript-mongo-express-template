import { Document } from 'mongoose';

interface ITag {
  key: string;
  name: string;
}

export interface ITagModel extends ITag, Document {}
