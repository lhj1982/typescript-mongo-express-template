import GenericService from './generic.service';
import logger from '../../middleware/logger.middleware';

import { InsufficientCreditsException } from '../../exceptions/custom.exceptions';

import { IOrderModel } from '../../data/repositories/order/order.model';
import { IUserModel } from '../../data/repositories/user/user.model';
import { IUserCouponModel } from '../../data/repositories/coupon/userCoupon.model';
import { IRefundModel } from '../../data/repositories/refund/refund.model';
import UserCouponsRepo from '../../data/repositories/coupon/userCoupons.repository';
import RefundsRepo from '../../data/repositories/refund/refunds.repository';
// import OrderService from './order.service';

import { getRandomString } from '../../utils/stringUtil';
import { nowDate } from '../../utils/dateUtil';

class CouponService extends GenericService {
  async findById(id: string): Promise<IUserCouponModel> {
    return await UserCouponsRepo.findById(id);
  }

  async getCoupons(couponIds: string[]): Promise<any> {
    try {
      const coupons = [];
      for (let i = 0; i < couponIds.length; i++) {
        const coupon = await UserCouponsRepo.findById(couponIds[i]);
        coupons.push(coupon);
      }
      return coupons;
    } catch (err) {
      throw err;
    }
  }

  async getUserCoupons(user: IUserModel, status: string[] = ['active']): Promise<IUserCouponModel[]> {
    const coupons = await UserCouponsRepo.findByUser(user, status);
    // console.log(coupons);
    return coupons;
  }

  async createRefunds(user: IUserModel, order: IOrderModel, coupons: IUserCouponModel[]): Promise<IRefundModel[]> {
    const { id: userId } = user;
    const { amount: totalOrderAmount } = order;
    let couponAmount = 0;
    for (let i = 0; i < coupons.length; i++) {
      const coupon = coupons[i];
      const { amount } = coupon;
      couponAmount += amount;
    }
    if (couponAmount > totalOrderAmount) {
      logger.error(`Refund amount is bigger than order amount`);
      throw new InsufficientCreditsException(userId, `Insufficient amount to refund.`);
    }
    const promises = coupons.map(async coupon => {
      const session = await this.getSession();
      session.startTransaction();
      try {
        const opts = { session };
        const { amount } = coupon;
        const refundParams = {
          user: userId,
          totalAmount: (totalOrderAmount * 100).toFixed(),
          refundAmount: (amount * 100).toFixed(),
          outRefundNo: getRandomString(32),
          refundDesc: `退款 - 抵用券返现 ${coupon.id}`,
          type: 'refund',
          status: 'approved',
          createdAt: nowDate()
        };
        const newRefund = await RefundsRepo.saveOrUpdate(refundParams, opts);
        // update coupon to refund
        const couponToUpdate = Object.assign(coupon, { status: 'refund' });
        await UserCouponsRepo.saveOrUpdate(couponToUpdate, opts);

        await session.commitTransaction();
        await this.endSession();
        return newRefund;
      } catch (err) {
        logger.error(`Error when creating refund coupon ${coupon.id}, order ${order.id}`);
        await session.abortTransaction();
        await this.endSession();
      }
    });
    const refunds = await Promise.all(promises);
    return refunds;
  }

  async saveOrUpdate(userCoupon: IUserCouponModel, options: any = {}): Promise<IUserCouponModel> {
    return await UserCouponsRepo.saveOrUpdate(userCoupon, options);
  }
}

export default new CouponService();
