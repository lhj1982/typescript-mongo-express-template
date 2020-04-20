import { Document } from 'mongoose';
import { IOrderModel } from '../order/order.model';
import { IUserModel } from '../user/user.model';
import { IUserCouponModel } from '../user/userCoupon.model';

interface IRefund {
  type: string;
  status?: string;
  totalAmount: number;
  refundAmount: number;
  refundDesc: string;
  refundRemainingAmount: string;
  outRefundNo: string;
  outTradeNo: string;
  returnCode: string;
  returnMsg: string;
  refundId: string;
  totalFee: number;
  resultCode: string;
  errCode: string;
  errCodeDesc: string;
  notifyResultCode: string;
  refundRequestSource: string;
  refundAccount: string;
  refundedAt: Date;
  createdAt: Date;
  approvedAt: Date;
}

export interface IRefundModel extends IRefund, Document {
  user: IUserModel;
  order: IOrderModel;
  coupons: IUserCouponModel[];
}
