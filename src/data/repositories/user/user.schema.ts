import { Schema } from 'mongoose';
import { IUserModel } from './user.model';

export const UserSchema: Schema<IUserModel> = new Schema(
  {
    openId: {
      type: String
    },
    unionId: {
      type: String
    },
    sessionKey: {
      type: String
    },
    nickName: {
      type: String,
      required: 'UserName is required'
    },
    username: {
      type: String
    },
    password: {
      type: String
      // required: 'Password is required'
    },
    description: {
      type: String
    },
    avatarUrl: {
      type: String
    },
    province: {
      type: String
    },
    city: {
      type: String
    },
    country: {
      type: String
    },
    language: {
      type: String
    },
    email: {
      type: String
    },
    company: {
      type: String
    },
    phone: {
      type: String
    },
    mobile: {
      type: String
    },
    mobileCountryCode: {
      type: String
    },
    contactMobile: {
      type: String
    },
    age: {
      type: Number
    },
    ageTag: {
      type: String
    },
    gender: {
      type: String,
      enum: ['male', 'female']
    },
    birthday: {
      type: String
    },
    wechatId: {
      type: String
    },
    accessToken: {
      type: String
    },
    expriedAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // dmShop: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Shop',
    //   description: 'shop that DM belong to'
    // },
    gameLevel: {
      type: Number
    },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'inactive'
    },
    numberOfEndorsements: {
      type: Number
    },
    topTags: [
      {
        _id: {
          type: String
        },
        name: {
          type: String
        },
        count: {
          type: Number
        }
      }
    ],
    credits: {
      type: Number,
      default: 0
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.virtual('employers', {
  ref: 'ShopStaff',
  localField: '_id',
  foreignField: 'user'
});

UserSchema.virtual('members', {
  ref: 'Member',
  localField: '_id',
  foreignField: 'user'
});

UserSchema.virtual('coupons', {
  ref: 'UserCoupon',
  localField: '_id',
  foreignField: 'owner'
});
