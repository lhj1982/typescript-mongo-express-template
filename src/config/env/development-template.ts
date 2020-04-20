module.exports = {
  server: {
    port: 3000,
    entrypoint: `http://localhost:3000`,
    cors: {
      whitelist: ['http://127.0.0.1:3000', 'wss://127.0.0.01:8888', 'undefined']
    },
    dbBatchSize: 25
  },
  cache: {
    password: 'password',
    duration: 2 * 60 * 60 // cache in second
  },
  appName: {
    jbfonline: {
      appId: 'wxf59749a45686779c',
      appSecret: '<app key>'
    },
    jbfmeetup: {
      appId: 'wxf59749a45686779c',
      appSecret: '<app key>'
    }
  },
  mch: {
    mchId: '1560901281',
    key: '<merch key>',
    payNotifyUrl: 'https://api.boogoogoo.com/orders/wechat/pay_callback',
    refundNotifyUrl: 'https://api.boogoogoo.com/orders/wechat/refund_callback',
    certFile: __dirname + '/../apiclient_cert.pem',
    certKeyFile: __dirname + '/../apiclient_key.pem'
  },
  logDir: __dirname + '/../../logs',
  dbUri: 'mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/jbs?replicaSet=rs0',
  jwt: {
    issuer: 'ademes',
    secret: 'JARF2YXNTA46ZH8F4Q2TBFHWE8DSDJCXAMGQTSSMWZKSPWC8FMWSL9YXU5PELUFN',
    duration: 2592000
  },
  query: {
    offset: 0,
    limit: 10
  },
  member: {
    memberCardNoLength: 16,
    maxNumberOfMemberCardToCreateInBatch: 100
  },
  event: {
    invitationDuration: 30, // in days
    invitationCodeLength: 12,
    coupon: {
      duration: 365 // in days
    }
  },
  qiniu: {
    bucket: 'jbs-server',
    accessKey: '<access key>',
    secretKey: '<access secret>',
    event: {
      qrcodeKeyPrefix: 'static/images/events/qrcode-dev',
      callbackUrl: 'https://api.boogoogoo.com/notifications/qrcode-upload-callback'
    }
  },
  sms: {
    templates: {},
    enabled: false,
    spCode: '1470',
    loginName: 'dyfhpy',
    password: '123456'
  }
};
