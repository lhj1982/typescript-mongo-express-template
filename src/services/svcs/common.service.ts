import * as mongoose from 'mongoose';
import { ClientSession } from 'mongoose';

export default class CommonService {
  session: any;
  async getSession() {
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
}
