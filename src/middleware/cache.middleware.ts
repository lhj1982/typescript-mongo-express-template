import { Request, Response, NextFunction } from 'express';
import logger from './logger.middleware';
import config from '../config';
// const client = redis.createClient();
// client.auth(config.cache.password);
const Redis = require('ioredis');
const client = new Redis({
  port: 6379, // Redis port
  host: '127.0.0.1', // Redis host
  family: 4, // 4 (IPv4) or 6 (IPv6)
  password: config.cache.password,
  db: 0
});

export default function cacheMiddleware(duration: number) {
  return (req: any, res: any, next: any) => {
    console.log('Cache service');
    next();
    // const { loggedInUser } = res.locals;

    // let key = '__expIress__' + req.originalUrl || req.url;
    // if (loggedInUser) {
    //   const { id: loggedInUserId } = loggedInUser;
    //   key = key + '|' + loggedInUserId;
    // }
    // client.get(key, (err: any, reply: any) => {
    //   if (reply) {
    //     logger.debug(`Found hit in cache, key: ${key}, value: ${reply}`);
    //     res.send(JSON.parse(reply));
    //   } else {
    //     logger.debug(`No hit is found in cache, key: ${key}`);
    //     res.sendResponse = res.send;
    //     res.send = (body: any) => {
    //       client.set(key, body, 'EX', duration);
    //       res.sendResponse(body);
    //     };
    //     next();
    //   }
    // });
  };
}
