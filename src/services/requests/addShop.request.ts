export interface IAddShopRequest {
  key: string;
  name: string;
  address: string;
  mobile: string;
  phone?: string;
  contactName: string;
  contactMobile: string;
  province?: string;
  city?: string;
  district?: string;
  wechatId?: string;
  wechatName?: string;
}
