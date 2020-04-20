export interface IOauthLoginRequest {
  appName: string;
  code: string;
  type: string;
  nickName?: string;
  avatarUrl?: string;
  gender?: string;
  encryptedData?: string;
  iv?: string;
  country?: string;
  province?: string;
  city?: string;
  language?: string;
  description?: string;
}
