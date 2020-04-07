import * as dotenv from 'dotenv';
import { Document, Schema, Model, model } from 'mongoose';
import * as path from 'path';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as xmlparser from 'express-xml-bodyparser';
import * as mongoose from 'mongoose';
import * as bluebird from 'bluebird';
import * as swaggerUi from 'swagger-ui-express';
import errorMiddleware from './middleware/error.middleare';
import config from './config';
import { RegisterRoutes } from './routes';
import * as fs from 'fs';

import { IUserModel } from './data/repositories/user/user.model';
import { IWatchListModel } from './data/repositories/user/watchList.model';
import { IShopModel } from './data/repositories/shop/shop.model';
import { IShopStaffModel } from './data/repositories/shop/shopStaff.model';
import { IScriptModel } from './data/repositories/script/script.model';
import { IEventModel } from './data/repositories/event/event.model';
import { IEventUserModel } from './data/repositories/event/eventUser.model';
import { IEventCommissionModel } from './data/repositories/event/eventCommission.model';

import { UserSchema } from './data/repositories/user/user.schema';
import { WatchListSchema } from './data/repositories/user/watchList.schema';
import { ShopSchema } from './data/repositories/shop/shop.schema';
import { ShopStaffSchema } from './data/repositories/shop/shopStaff.schema';
import { ScriptSchema } from './data/repositories/script/script.schema';
import { EventSchema } from './data/repositories/event/event.schema';
import { EventUserSchema } from './data/repositories/event/eventUser.schema';
import { EventCommissionSchema } from './data/repositories/event/eventCommission.schema';

const User: Model<IUserModel> = model<IUserModel>('User', UserSchema);
const WatchList: Model<IWatchListModel> = model<IWatchListModel>('WatchList', WatchListSchema);
const Shop: Model<IShopModel> = model<IShopModel>('Shop', ShopSchema);
const ShopStaff: Model<IShopStaffModel> = model<IShopStaffModel>('ShopStaff', ShopStaffSchema);
const Script: Model<IScriptModel> = model<IScriptModel>('Script', ScriptSchema);
const Event: Model<IEventModel> = model<IEventModel>('Event', EventSchema);
const EventUser: Model<IEventUserModel> = model<IEventUserModel>('EventUser', EventUserSchema);
const EventCommission: Model<IEventCommissionModel> = model<IEventCommissionModel>('EventCommission', EventCommissionSchema);
// Set env values
dotenv.config();

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

mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${process.env.DB_NAME}`);
});

// Configure Rate Limiter
const { RateLimiterMongo } = require('rate-limiter-flexible');
const rateLimiterMongo = new RateLimiterMongo({
  storeClient: mongoose.connection,
  points: 4,
  duration: 1
}); // 4 request in 1 second per ip address
const rateLimiter = (req: any, res: any, next: any) => {
  rateLimiterMongo
    .consume(req.ip)
    .then(() => next())
    .catch(() => res.status(429).send('Whoa! Slow down there little buddy'));
};

// Configure CORS
const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (process.env.CORS_WHITELIST && process.env.CORS_WHITELIST.indexOf(origin) !== -1) callback(null, true);
    else callback('Not allowed by CORS');
  },
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
};

// Configure App
const app = express();

// app.use(rateLimiter);
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(xmlparser());

const http = require('http').Server(app);

// Start Server
const port = process.env.API_PORT;
http.listen(port, () => {
  console.log(`listening on ${port}`);
});

// Start Swagger Docs
RegisterRoutes(app);
app.use(errorMiddleware);
try {
  const swaggerDocument = require('../swagger.json');
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.log('Unable to load swagger.json', err);
}

export = app;
