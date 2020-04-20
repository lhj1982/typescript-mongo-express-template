export interface IUpdatePhoneNumberRequest {
  appName: string;
  openId: string;
  iv: string;
  encryptedData: string;
}
