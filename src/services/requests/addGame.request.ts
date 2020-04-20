export interface IAddGameRequest {
  shopId: string;
  scriptId: string;
  startTime: string;
  hostUserId: string;
  hostComment?: string;
  price: number;
  code?: string;
  hostUserMobile?: string;
  hostUserWechatId?: string;
}
