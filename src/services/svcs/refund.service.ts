import GenericService from './generic.service';
import logger from '../../middleware/logger.middleware';

import { IRefundModel } from '../../data/repositories/refund/refund.model';
import OrdersRepo from '../../data/repositories/order/orders.repository';
import RefundsRepo from '../../data/repositories/refund/refunds.repository';
import { ResourceNotFoundException, RefundAlreadyPerformedException } from '../../exceptions/custom.exceptions';

class RefundService extends GenericService {
  async findByRefundNo(outRefundNo: string): Promise<IRefundModel> {
    return await RefundsRepo.findByRefundNo(outRefundNo);
  }

  async confirmWechatRefund(wechatRefundData: any): Promise<IRefundModel> {
    const session = await this.getSession();
    session.startTransaction();
    try {
      const opts = { session };

      const { outRefundNo, refundStatus } = wechatRefundData;

      const refund = await this.findByRefundNo(outRefundNo);
      if (!refund) {
        throw new ResourceNotFoundException('Refund', outRefundNo);
      }
      const { _id, status, order } = refund;
      if (status === 'refund' || status === 'failed') {
        throw new RefundAlreadyPerformedException(_id, status);
      }

      let refundToUpdate = {};
      if (refundStatus !== 'SUCCESS') {
        refundToUpdate = Object.assign(refund.toObject(), { status: 'failed' }, wechatRefundData);
      } else {
        const { orderStatus } = order;
        if (orderStatus !== 'refunded') {
          const orderToUpdate = Object.assign(order.toObject(), {
            orderStatus: 'refunded'
          });
          console.log(orderToUpdate);
          await OrdersRepo.saveOrUpdate(orderToUpdate, opts);
        }
        refundToUpdate = Object.assign({}, refund.toObject(), wechatRefundData);
      }
      // console.log(refundToUpdate);
      const newRefund = await RefundsRepo.saveOrUpdate(refundToUpdate, opts);
      await session.commitTransaction();
      await this.endSession();
      return newRefund;
    } catch (err) {
      await session.abortTransaction();
      await this.endSession();
      logger.error(err);
      throw err;
    }
  }
}

export default new RefundService();
