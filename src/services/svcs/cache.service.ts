import logger from '../../middleware/logger';
import config from '../../config';
// import GamesRepo from '../repositories/games.repository';
// import GamePlayersRepo from '../repositories/gamePlayers.repository';
const Redis = require('ioredis');
const client = new Redis({
  port: 6379, // Redis port
  host: '127.0.0.1', // Redis host
  family: 4, // 4 (IPv4) or 6 (IPv6)
  password: config.cache.password,
  db: 0
});
// client.auth(config.cache.password);

class CacheService {
  keyPrefix = '__expIress__';

  async purgeUserCache(userIds: string[]): Promise<void> {
    logger.debug(`Purge user cache for ${userIds}...`);
    await this.deleteKeysByPattern(`__expIress__/profile*`);
    userIds.forEach(async userId => {
      await this.deleteKeysByPattern(`__expIress__/users/${userId}/*`);
    });
  }

  // async purgeEventCache(event: any, req: Request): Promise<void> {
  //   // const token = req.headers.authorization.split(' ')[1];
  //   // let myEventsKey = `${this.keyPrefix}/profile/my-events`;
  //   // let eventsKey = `${this.keyPrefix}/events?*`;
  //   // if (token) {
  //   //   myEventsKey = myEventsKey + '|' + token;
  //   //   eventsKey = eventsKey + '|' + token;
  //   // }
  //   // await this.purgeCacheByKey(myEventsKey);
  //   // // await this.purgeCacheBySearch(eventsKey);
  // }

  async purgeGameScriptClueCache(game: any): Promise<void> {
    const { id: gameId } = game;
    await this.deleteKeysByPattern(`__expIress__/games/${gameId}/clues/*`);
  }

  //key example "prefix*"
  getKeysByPattern(key: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      try {
        const stream = client.scanStream({
          // only returns keys following the pattern of "key"
          match: key,
          // returns approximately 100 elements per call
          count: 100
        });

        const keys: any[] = [];
        stream.on('data', function(resultKeys: any) {
          // `resultKeys` is an array of strings representing key names
          for (let i = 0; i < resultKeys.length; i++) {
            keys.push(resultKeys[i]);
          }
        });
        stream.on('end', function() {
          resolve(keys);
        });
      } catch (err) {
        logger.error(err);
        reject(err);
      }
    });
  }

  //key example "prefix*"
  deleteKeysByPattern(key): void {
    const stream = client.scanStream({
      // only returns keys following the pattern of "key"
      match: key,
      // returns approximately 100 elements per call
      count: 100
    });

    const keys: any[] = [];
    stream.on('data', function(resultKeys: any) {
      // `resultKeys` is an array of strings representing key names
      for (let i = 0; i < resultKeys.length; i++) {
        logger.debug(`Purge cache key ${resultKeys[i]}`);
        keys.push(resultKeys[i]);
      }
    });
    stream.on('end', function() {
      logger.info(`${keys.length} cache entries has purged`);
      if (keys.length > 0) {
        client.unlink(keys);
      }
    });
  }
}

export default new CacheService();
