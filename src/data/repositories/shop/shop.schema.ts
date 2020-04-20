import { Schema } from 'mongoose';
import { IShopModel } from './shop.model';
// import { ScriptSchema } from './script.entity';

export const ShopSchema: Schema<IShopModel> = new Schema(
  {
    name: {
      type: String
    },
    key: {
      type: String,
      required: 'shop key is required!'
    },
    address: {
      type: String
    },
    description: {
      type: String
    },
    brandingImage: {
      type: String
    },
    mobiles: [
      {
        type: String
      }
    ],
    phone: {
      type: String
    },
    // userId: {
    //   type: String
    // },
    province: {
      type: String
    },
    city: {
      type: String
    },
    district: {
      type: String
    },
    supportedPaymentMethods: [
      {
        type: String,
        enum: ['wechat']
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    },
    scripts: [{ type: Schema.Types.ObjectId, ref: 'Script' }],
    onlineScripts: [{ type: Schema.Types.ObjectId, ref: 'Script' }]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ShopSchema.virtual('shopStaffs', {
  ref: 'ShopStaff',
  localField: '_id',
  foreignField: 'shop'
});
