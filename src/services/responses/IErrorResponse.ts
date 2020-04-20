/**
 * @example
 * {
 *   "status": 401,
 *   "code": "unauthorized",
 *   "message": "Error"
 * }
 */
export interface IErrorResponse {
  status: number;
  code: string;
  message?: string;
}
