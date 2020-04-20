import { Schema } from 'mongoose';
import { IRefundModel } from './refund.model';

export const RefundSchema: Schema<IRefundModel> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    type: {
      type: String,
      enum: ['refund', 'commission']
    },
    status: {
      type: String,
      enum: ['created', 'approved', 'refund', 'failed']
    },
    totalAmount: {
      type: Number,
      required: 'TotalAmount is required'
    },
    refundAmount: {
      type: Number,
      required: 'RefundAmount is required'
    },
    // This is the description field to describe for what purpose this refund is, it can be
    // cancel event, event commission - host, event commission - participator, event commission remaining - host
    refundDesc: {
      type: String
    },
    refundRemainingAmount: {
      type: Number
    },
    outRefundNo: {
      type: String
    },
    outTradeNo: {
      type: String
    },
    coupons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'UserCoupon'
      }
    ],
    returnCode: {
      type: String
    },
    returnMsg: {
      type: String
    },
    refundId: {
      type: String
    },
    totalFee: {
      type: Number
    },
    refundFee: {
      type: Number
    },
    refundStatus: {
      type: String
    },
    resultCode: {
      type: String
    },
    errCode: {
      type: String
    },
    errCodeDesc: {
      type: String
    },
    notifyResultCode: {
      type: String
    },
    refundRequestSource: {
      type: String
    },
    refundAccount: {
      type: String
    },
    refundedAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    approvedAt: {
      type: Date
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
