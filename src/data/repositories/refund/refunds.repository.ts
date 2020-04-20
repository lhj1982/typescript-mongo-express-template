import { model } from 'mongoose';
import { IRefundModel } from './refund.model';
import { RefundSchema } from './refund.schema';
const Refund = model<IRefundModel>('Refund', RefundSchema, 'refunds');
// mongoose.set('useFindAndModify', false);

class RefundsRepo {
  async findByRefundNo(refundNo: string, opts = {}): Promise<IRefundModel> {
    return await Refund.findOne({ outRefundNo: refundNo }, opts)
      .populate('order')
      .exec();
  }

  async getRefundableOrders(filter: any, opts = {}): Promise<IRefundModel[]> {
    const { status } = filter;
    return await Refund.find({ status }, opts)
      .populate('order')
      .exec();
  }

  async findById(id: string): Promise<IRefundModel> {
    return await Refund.findOne({ _id: id })
      .populate('order')
      .exec();
  }

  async saveOrUpdate(refund, opts = {}): Promise<IRefundModel> {
    const options = {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { _id, outRefundNo } = refund;
    if (_id) {
      return await Refund.findOneAndUpdate({ _id }, refund, options).exec();
    } else {
      return await Refund.findOneAndUpdate({ outRefundNo }, refund, options).exec();
    }
  }
}

export default new RefundsRepo();
