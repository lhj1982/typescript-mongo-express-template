import { model } from 'mongoose';
import { ILoginSessionModel } from './loginSession.model';
import { LoginSessionSchema } from './loginSession.schema';
const LoginSession = model<ILoginSessionModel>('LoginSession', LoginSessionSchema, 'loginSessions');
// mongoose.set('useFindAndModify', false);

class LoginSessionsRepo {
  async addNew(loginSession, opt = {}): Promise<ILoginSessionModel> {
    const options = {
      ...opt,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const sessionObj = new LoginSession(loginSession);
    return await sessionObj.save();
  }

  async updateSession(session, opt = {}): Promise<ILoginSessionModel> {
    const options = {
      ...opt,
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      returnNewDocument: true
    };
    const { appId, code, openId } = session;
    return await LoginSession.findOneAndUpdate({ appId, code, openId }, session, options).exec();
  }
}
export default new LoginSessionsRepo();
