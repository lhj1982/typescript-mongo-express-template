import { Document } from 'mongoose';

interface IRole {
  name: string;
  permissions?: string[];
}

export interface IRoleModel extends IRole, Document {}
