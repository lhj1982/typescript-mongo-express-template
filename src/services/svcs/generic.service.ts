import * as mongoose from 'mongoose';
import { ClientSession } from 'mongoose';
import config from '../../config';

export default class GenericService {
  session: ClientSession;
  async getSession(): Promise<ClientSession> {
    if (!this.session) {
      this.session = await mongoose.startSession();
    }
    return this.session;
  }

  async endSession(): Promise<void> {
    if (!this.session) {
      this.session.endSession();
    }
  }

  /**
   * [getBatchSize description]
   * @param  {number} totalAmount [description]
   * @return {number}             [description]
   */
  getBatchSize(totalAmount: number): any {
    const oneBatchSize = config.server.dbBatchSize;
    const batchesSize = totalAmount % oneBatchSize === 0 ? totalAmount / oneBatchSize : (totalAmount / oneBatchSize + 1).toFixed();
    return batchesSize;
  }
}
