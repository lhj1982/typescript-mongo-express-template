import { Controller } from 'tsoa';
import config from '../../config';

export default class GenericController extends Controller {
  generateLinks = (pagination: any, originalUrl: any, querystring: string): object => {
    const { limit, offset: currentOffset, total } = pagination;
    const nextOffset = (currentOffset + 1) * limit < total ? currentOffset + 1 : currentOffset;
    const prevOffset = currentOffset > 0 ? currentOffset - 1 : currentOffset;
    const next = `${config.server.entrypoint}${originalUrl}?limit=${limit}&offset=${nextOffset}&${querystring}`;
    const prev = `${config.server.entrypoint}${originalUrl}?limit=${limit}&offset=${prevOffset}&${querystring}`;
    return { links: { next, prev } };
  };

  /**
   * Get updated number of persion after event update.
   *
   * @type {[type]}
   */
  // getUpdatedEventParticipators = (event, type, amount = 0) => {
  //   const { numberOfPersons } = event;
  //   let { numberOfAvailableSpots, numberOfPlayers, numberOfOfflinePlayers } = event;
  //   if (!numberOfAvailableSpots) {
  //     numberOfAvailableSpots = 0;
  //   }
  //   if (!numberOfPlayers) {
  //     numberOfPlayers = 0;
  //   }
  //   if (type === 'joinEvent') {
  //     numberOfPlayers = amount;
  //   }
  //   if (type === 'updateOfflinePersons') {
  //     numberOfOfflinePlayers = amount;
  //   }
  //   numberOfAvailableSpots = numberOfPersons - numberOfPlayers - numberOfOfflinePlayers;

  //   return {
  //     numberOfAvailableSpots,
  //     numberOfPlayers,
  //     numberOfOfflinePlayers
  //   };
  // };
}
