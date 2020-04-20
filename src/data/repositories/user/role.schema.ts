import { Schema } from 'mongoose';
import { IRoleModel } from './role.model';
export const RoleSchema: Schema<IRoleModel> = new Schema(
  {
    name: {
      type: String
    },
    permissions: [
      {
        domain: String,
        operations: [{ type: String }]
      }
    ]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
