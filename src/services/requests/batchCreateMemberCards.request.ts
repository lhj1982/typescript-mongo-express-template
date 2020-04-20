/**
 * @example
 * {
 *   "number": 5,
 *   "cardTypeId": "xxx"
 * }
 * @param {number} count number of cards to create
 * @param {string} cardTypeId member card type
 */
export interface IBatchCreateMemberCardsRequest {
  count: number;
  cardTypeId: string;
}
