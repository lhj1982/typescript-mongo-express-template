export interface IGetWechatDataRequest {
  encryptedData: string;
  iv: string;
  appName: string;
  sessionKey: string;
}
