/**
 * @example
 * {
 * 	"nickName": "test",
 * 	"description": "xxx",
 * 	"email": "xxx",
 * 	"wechatId": "xxx",
 * 	"avatarImage": "xxx",
 * 	"ageTag": "xxx",
 * 	"gameLevel": 0
 * }
 */
export interface IUpdateUserRequest {
  nickName?: string;
  description?: string;
  email?: string;
  wechatId?: string;
  avatarImage?: string;
  ageTag?: string;
  gameLevel?: number;
}
