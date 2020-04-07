export interface IAddEventRequest {
  shopId: string;
  scriptId: string;
  startTime: string;
  endTime?: string;
  hostUserId: string;
  hostComment?: string;
  numberOfPlayers?: number;
  price: number;
  hostUserMobile?: string;
  hostUserWechatId?: string;
  numberOfOfflinePlayers?: number;
  isHostJoin?: boolean;
  supportPayment?: boolean;
}
