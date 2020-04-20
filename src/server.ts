import * as dotenv from 'dotenv';
import { Model, model } from 'mongoose';
// import * as path from 'path';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as xmlparser from 'express-xml-bodyparser';
import * as mongoose from 'mongoose';
import * as bluebird from 'bluebird';
import * as swaggerUi from 'swagger-ui-express';
import cacheMiddleware from './middleware/cache.middleware';
import logger from './middleware/logger.middleware';
import errorMiddleware from './middleware/error.middleare';
import config from './config';
import { RegisterRoutes } from './routes';
// import * as fs from 'fs';

// import { IUserModel } from './data/repositories/user/user.model';
// import { IWatchListModel } from './data/repositories/user/watchList.model';
// import { IShopModel } from './data/repositories/shop/shop.model';
import { IShopStaffModel } from './data/repositories/shop/shopStaff.model';
// import { IScriptModel } from './data/repositories/script/script.model';
import { IScriptRundownModel } from './data/repositories/script/scriptRundown.model';
import { IScriptClueModel } from './data/repositories/script/scriptClue.model';
import { IScriptClueFilterModel } from './data/repositories/script/scriptClueFilter.model';
// import { IEventModel } from './data/repositories/event/event.model';
// import { IEventUserModel } from './data/repositories/event/eventUser.model';
// import { IEventCommissionModel } from './data/repositories/event/eventCommission.model';
// import { ITagModel } from './data/repositories/tag/tag.model';
// import { IUserTagModel } from './data/repositories/tag/userTag.model';
import { ILoginSessionModel } from './data/repositories/user/loginSession.model';
import { IMemberModel } from './data/repositories/member/member.model';
import { IMemberLevelModel } from './data/repositories/member/memberLevel.model';

// import { UserSchema } from './data/repositories/user/user.schema';
// import { WatchListSchema } from './data/repositories/user/watchList.schema';
// import { ShopSchema } from './data/repositories/shop/shop.schema';
import { ShopStaffSchema } from './data/repositories/shop/shopStaff.schema';
// import { ScriptSchema } from './data/repositories/script/script.schema';
import { ScriptRundownSchema } from './data/repositories/script/scriptRundown.schema';
import { ScriptClueSchema } from './data/repositories/script/scriptClue.schema';
import { ScriptClueFilterSchema } from './data/repositories/script/scriptClueFilter.schema';
// import { EventSchema } from './data/repositories/event/event.schema';
// import { EventUserSchema } from './data/repositories/event/eventUser.schema';
// import { EventCommissionSchema } from './data/repositories/event/eventCommission.schema';
// import { TagSchema } from './data/repositories/tag/tag.schema';
// import { UserTagSchema } from './data/repositories/tag/UserTag.schema';
import { LoginSessionSchema } from './data/repositories/user/loginSession.schema';
import { MemberSchema } from './data/repositories/member/member.schema';
import { MemberLevelSchema } from './data/repositories/member/memberLevel.schema';

// const User: Model<IUserModel> = model<IUserModel>('User', UserSchema, 'users');
// const WatchList: Model<IWatchListModel> = model<IWatchListModel>('WatchList', WatchListSchema, 'watchLists');
// const Shop: Model<IShopModel> = model<IShopModel>('Shop', ShopSchema, 'shops');
const ShopStaff: Model<IShopStaffModel> = model<IShopStaffModel>('ShopStaff', ShopStaffSchema, 'shopStaffs');
// const Script: Model<IScriptModel> = model<IScriptModel>('Script', ScriptSchema, 'scripts');
const ScriptRundown: Model<IScriptRundownModel> = model<IScriptRundownModel>('ScriptRundown', ScriptRundownSchema, 'scriptRundowns');
const ScriptClue: Model<IScriptClueModel> = model<IScriptClueModel>('ScriptClue', ScriptClueSchema, 'scriptClues');
const ScriptClueFilter: Model<IScriptClueFilterModel> = model<IScriptClueFilterModel>('ScriptClueFilter', ScriptClueFilterSchema, 'scriptClueFilters');
// const Event: Model<IEventModel> = model<IEventModel>('Event', EventSchema, 'events');
// const EventUser: Model<IEventUserModel> = model<IEventUserModel>('EventUser', EventUserSchema, 'eventUsers');
// const EventCommission: Model<IEventCommissionModel> = model<IEventCommissionModel>('EventCommission', EventCommissionSchema, 'eventCommissions');
// const Tag: Model<ITagModel> = model<ITagModel>('Tag', TagSchema, 'tags');
// const UserTag: Model<IUserTagModel> = model<IUserTagModel>('UserTag', UserTagSchema, 'userTags');
const LoginSession = model<ILoginSessionModel>('LoginSession', LoginSessionSchema, 'loginSessions');
const Member = model<IMemberModel>('Member', MemberSchema, 'members');
const MemberLevel = model<IMemberModel>('MemberLevel', MemberSchema, 'memberLevels');
// Set env values
dotenv.config();
const compression = require('compression');

// Connect to MongoDB
(mongoose as any).Promise = bluebird;
mongoose.connect(`${config.dbUri}`, {
  useCreateIndex: true,
  useNewUrlParser: true,
  replicaSet: 'rs0',
  useUnifiedTopology: true,
  useFindAndModify: false,
  autoIndex: false,
  poolSize: 10,
  connectTimeoutMS: 45000
});

// mongoose.connection.on('error', () => {
//   throw new Error(`unable to connect to database: ${process.env.DB_NAME}`);
// });

mongoose.connection.on('connected', () => {
  logger.info('Connection Established');
});

mongoose.connection.on('reconnected', () => {
  logger.warn('Connection Reestablished');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Connection Disconnected');
});

mongoose.connection.on('close', () => {
  logger.warn('Connection Closed');
});

mongoose.connection.on('error', error => {
  logger.error('ERROR: ' + error);
});

// Configure Rate Limiter
const { RateLimiterMongo } = require('rate-limiter-flexible');
const rateLimiterMongo = new RateLimiterMongo({
  storeClient: mongoose.connection,
  points: 4,
  duration: 1
}); // 4 request in 1 second per ip address
const rateLimiter = (req: any, res: any, next: any): any => {
  rateLimiterMongo
    .consume(req.ip)
    .then(() => next())
    .catch(() => res.status(429).send('Whoa! Slow down there little buddy'));
};

// Configure CORS
/*
(origin: any, callback: any) => {
    logger.info(`origin: ${origin}`);
    if (!origin || (config.server.cors.whitelist && config.server.cors.whitelist.indexOf(origin) !== -1)) {
      callback(null, true);
    } else {
      callback('Not allowed by CORS');
    }
  }
 */
const corsOptions = {
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'Credentials', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Configure App
const app = express();

// app.use(rateLimiter);
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(xmlparser());
app.use((req, res, next) => {
  logger.info(`Request from: ${req.originalUrl}`);
  logger.info(`Request type: ${req.method}`);
  next();
});
app.get('/', function(req, res) {
  res.send('jubenfan api v1.0.0');
});
app.get('/healthcheck', function(req, res) {
  res.send('OK');
});
app.use(compression());

app.use(cacheMiddleware(config.cache.duration));

const http = require('http').Server(app);

// Start Server
// const port = config.server.port;
http.listen(config.server.port, () => {
  console.log(`listening on ${config.server.port}`);
});

// Start Swagger Docs
RegisterRoutes(app);
app.use(errorMiddleware);
try {
  const swaggerDocument = require('../swagger.json');
  swaggerDocument.host = config.server.entrypoint;
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.log('Unable to load swagger.json', err);
}

export = app;
