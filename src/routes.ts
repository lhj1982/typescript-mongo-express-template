/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import {
  Controller,
  ValidationService,
  FieldErrors,
  ValidateError,
  TsoaRoute
} from "tsoa";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from "./services/controllers/auth.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CounponsController } from "./services/controllers/coupons.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { EventsController } from "./services/controllers/events.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GamesController } from "./services/controllers/games.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MembersController } from "./services/controllers/members.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { NotificationsController } from "./services/controllers/notifications.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OrdersController } from "./services/controllers/orders.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PricesController } from "./services/controllers/prices.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProfileController } from "./services/controllers/profile.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ScriptsController } from "./services/controllers/scripts.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ShopsController } from "./services/controllers/shops.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TagsController } from "./services/controllers/tags.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UsersController } from "./services/controllers/users.controller";
import { expressAuthentication } from "./middleware/authentication";
import * as express from "express";

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
  IResponse: {
    dataType: "refObject",
    properties: {
      code: { dataType: "string", required: true },
      data: { dataType: "any", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IErrorResponse: {
    dataType: "refObject",
    properties: {
      status: { dataType: "double", required: true },
      code: { dataType: "string", required: true },
      message: { dataType: "string" }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IOauthLoginRequest: {
    dataType: "refObject",
    properties: {
      appName: { dataType: "string", required: true },
      code: { dataType: "string", required: true },
      type: { dataType: "string", required: true },
      nickName: { dataType: "string" },
      avatarUrl: { dataType: "string" },
      gender: { dataType: "string" },
      encryptedData: { dataType: "string" },
      iv: { dataType: "string" },
      country: { dataType: "string" },
      province: { dataType: "string" },
      city: { dataType: "string" },
      language: { dataType: "string" },
      description: { dataType: "string" }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IUpdatePhoneNumberRequest: {
    dataType: "refObject",
    properties: {
      appName: { dataType: "string", required: true },
      openId: { dataType: "string", required: true },
      iv: { dataType: "string", required: true },
      encryptedData: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ICode2SessionRequest: {
    dataType: "refObject",
    properties: {
      appName: { dataType: "string", required: true },
      code: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ICreateCouponRefunds: {
    dataType: "refObject",
    properties: {
      couponIds: { dataType: "string", required: true },
      orderId: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IAddEventRequest: {
    dataType: "refObject",
    properties: {
      shopId: { dataType: "string", required: true },
      scriptId: { dataType: "string", required: true },
      startTime: { dataType: "string", required: true },
      endTime: { dataType: "string" },
      hostUserId: { dataType: "string", required: true },
      hostComment: { dataType: "string" },
      numberOfPlayers: { dataType: "double" },
      price: { dataType: "double", required: true },
      hostUserMobile: { dataType: "string" },
      hostUserWechatId: { dataType: "string" },
      numberOfOfflinePlayers: { dataType: "double" },
      isHostJoin: { dataType: "boolean" },
      supportPayment: { dataType: "boolean" }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IUpdateEventRequest: {
    dataType: "refObject",
    properties: {
      numberOfOfflinePlayers: { dataType: "double" },
      hostComment: { dataType: "string" },
      price: { dataType: "double" },
      startTime: { dataType: "string" }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IJoinEventRequest: {
    dataType: "refObject",
    properties: {
      userName: { dataType: "string" },
      source: { dataType: "string", required: true },
      userId: { dataType: "string", required: true },
      mobile: { dataType: "string" },
      wechatId: { dataType: "string" },
      invitationCode: { dataType: "string" }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ICancelEventUserRequest: {
    dataType: "refObject",
    properties: {
      userId: { dataType: "string", required: true },
      status: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IUpdateEventUserStatusRequest: {
    dataType: "refObject",
    properties: {
      userId: { dataType: "string", required: true },
      status: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ICompleteEventRequest: {
    dataType: "refObject",
    properties: {
      status: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IInviteUserRequest: {
    dataType: "refObject",
    properties: {
      inviteeMobile: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IAddGameRequest: {
    dataType: "refObject",
    properties: {
      shopId: { dataType: "string", required: true },
      scriptId: { dataType: "string", required: true },
      startTime: { dataType: "string", required: true },
      hostUserId: { dataType: "string", required: true },
      hostComment: { dataType: "string" },
      price: { dataType: "double", required: true },
      code: { dataType: "string" },
      hostUserMobile: { dataType: "string" },
      hostUserWechatId: { dataType: "string" }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IJoinGameRequest: {
    dataType: "refObject",
    properties: {
      roomId: { dataType: "string", required: true },
      playerId: { dataType: "string", required: true },
      code: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ILeaveGameRequest: {
    dataType: "refObject",
    properties: {
      roomId: { dataType: "string", required: true },
      playerId: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IUpdateGameRequest: {
    dataType: "refObject",
    properties: {
      startTime: { dataType: "string", required: true },
      hostComment: { dataType: "string", required: true },
      status: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IBatchCreateMemberCardsRequest: {
    dataType: "refObject",
    properties: {
      count: { dataType: "double", required: true },
      cardTypeId: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IGetSMSReportsRequest: {
    dataType: "refObject",
    properties: {
      reports: { dataType: "any", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ICreateRefundRequest: {
    dataType: "refObject",
    properties: {
      coupons: {
        dataType: "array",
        array: { dataType: "string" },
        required: true
      }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IUpdateRefundRequest: {
    dataType: "refObject",
    properties: {
      status: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IAddDiscountRuleRequest: {
    dataType: "refObject",
    properties: {
      key: { dataType: "string", required: true },
      description: { dataType: "string", required: true },
      timeDescription: { dataType: "string", required: true },
      timeSpan: { dataType: "string", required: true },
      days: {
        dataType: "array",
        array: { dataType: "string" },
        required: true
      },
      discount: {
        dataType: "nestedObjectLiteral",
        nestedProperties: {
          invitor: { dataType: "double", required: true },
          participator: { dataType: "double", required: true },
          host: { dataType: "double", required: true }
        },
        required: true
      }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IUserResponse: {
    dataType: "refObject",
    properties: {
      code: { dataType: "string", required: true },
      data: {
        dataType: "nestedObjectLiteral",
        nestedProperties: {},
        required: true
      }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IGetWechatDataRequest: {
    dataType: "refObject",
    properties: {
      encryptedData: { dataType: "string", required: true },
      iv: { dataType: "string", required: true },
      appName: { dataType: "string", required: true },
      sessionKey: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IAddScriptRequest: {
    dataType: "refObject",
    properties: {
      key: { dataType: "string", required: true },
      name: { dataType: "string", required: true },
      description: { dataType: "string", required: true },
      minNumberOfSpots: { dataType: "double", required: true },
      maxNumberOfSpots: { dataType: "double", required: true },
      duration: { dataType: "double", required: true },
      coverImage: { dataType: "string", required: true },
      tags: { dataType: "array", array: { dataType: "string" }, required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IAddShopRequest: {
    dataType: "refObject",
    properties: {
      key: { dataType: "string", required: true },
      name: { dataType: "string", required: true },
      address: { dataType: "string", required: true },
      mobile: { dataType: "string", required: true },
      phone: { dataType: "string" },
      contactName: { dataType: "string", required: true },
      contactMobile: { dataType: "string", required: true },
      province: { dataType: "string" },
      city: { dataType: "string" },
      district: { dataType: "string" },
      wechatId: { dataType: "string" },
      wechatName: { dataType: "string" }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IUpdateUserRequest: {
    dataType: "refObject",
    properties: {
      nickName: { dataType: "string" },
      description: { dataType: "string" },
      email: { dataType: "string" },
      wechatId: { dataType: "string" },
      avatarImage: { dataType: "string" },
      ageTag: { dataType: "string" },
      gameLevel: { dataType: "double" }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IAddUserTagRequest: {
    dataType: "refObject",
    properties: {
      tagId: { dataType: "string", required: true },
      type: { dataType: "string", required: true },
      objectId: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ISubscribeMemberRequest: {
    dataType: "refObject",
    properties: {
      memberCardTypeId: { dataType: "string", required: true }
    },
    additionalProperties: true
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  IRedeemMemberCardRequest: {
    dataType: "refObject",
    properties: {
      redeemCode: { dataType: "string", required: true }
    },
    additionalProperties: true
  }
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: express.Express) {
  // ###########################################################################################################
  //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
  //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
  // ###########################################################################################################
  app.post("/oauth/login", function(request: any, response: any, next: any) {
    const args = {
      body: {
        in: "body",
        name: "body",
        required: true,
        ref: "IOauthLoginRequest"
      }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new AuthController();

    const promise = controller.login.apply(controller, validatedArgs as any);
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post("/oauth/phonenumber", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      body: {
        in: "body",
        name: "body",
        required: true,
        ref: "IUpdatePhoneNumberRequest"
      }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new AuthController();

    const promise = controller.updatePhoneNumber.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post("/oauth/code2session", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      body: {
        in: "body",
        name: "body",
        required: true,
        ref: "ICode2SessionRequest"
      }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new AuthController();

    const promise = controller.code2session.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/coupons/:couponId/activate",
    authenticateMiddleware([{ access_token: ["coupon:approveCoupon"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        couponId: {
          in: "path",
          name: "couponId",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new CounponsController();

      const promise = controller.activateCoupon.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/coupons/create-refunds",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "ICreateCouponRefunds"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new CounponsController();

      const promise = controller.createCouponRefunds.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/events/calendar/:date", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      date: { in: "path", name: "date", required: true, dataType: "string" },
      status: { in: "query", name: "status", dataType: "string" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new EventsController();

    const promise = controller.getEventsByDate.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/events/calendar/:date/count", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      date: { in: "path", name: "date", required: true, dataType: "string" },
      status: { in: "query", name: "status", dataType: "string" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new EventsController();

    const promise = controller.getEventsCountByDate.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/events/price-schema", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      scriptId: { in: "query", name: "scriptId", dataType: "string" },
      shopId: { in: "query", name: "shopId", dataType: "string" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new EventsController();

    const promise = controller.getPriceWeeklySchema.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/events/discount-rules", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      shopId: {
        in: "query",
        name: "shopId",
        required: true,
        dataType: "string"
      },
      scriptId: { in: "query", name: "scriptId", dataType: "string" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new EventsController();

    const promise = controller.getDiscountRules.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/events/archive-events",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {};

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new EventsController();

      const promise = controller.archiveEvents.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/events", function(request: any, response: any, next: any) {
    const args = {
      req: { in: "request", name: "req", required: true, dataType: "object" },
      filter: { in: "query", name: "filter", dataType: "any" },
      keyword: { in: "query", name: "keyword", dataType: "string" },
      sort: { in: "query", name: "sort", dataType: "any" },
      offset: { in: "query", name: "offset", dataType: "double" },
      limit: { in: "query", name: "limit", dataType: "double" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new EventsController();

    const promise = controller.getEvents.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post("/events", authenticateMiddleware([{ access_token: [] }]), function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      body: {
        in: "body",
        name: "body",
        required: true,
        ref: "IAddEventRequest"
      },
      req: { in: "request", name: "req", required: true, dataType: "object" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new EventsController();

    const promise = controller.addEvent.apply(controller, validatedArgs as any);
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/events/:eventId",
    authenticateMiddleware([{ access_token: ["event:updateEventById"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        eventId: {
          in: "path",
          name: "eventId",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IUpdateEventRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new EventsController();

      const promise = controller.updateEvent.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/events/:eventId/join",
    authenticateMiddleware([{ access_token: ["event-user:joinEvent"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        eventId: {
          in: "path",
          name: "eventId",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IJoinEventRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new EventsController();

      const promise = controller.joinUserEvent.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/events/:eventId",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        eventId: {
          in: "path",
          name: "eventId",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new EventsController();

      const promise = controller.getEventDetails.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/events/:eventId/simplified", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      eventId: {
        in: "path",
        name: "eventId",
        required: true,
        dataType: "string"
      }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new EventsController();

    const promise = controller.getEventDetailsSimplified.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/events/:eventId/users/cancel",
    authenticateMiddleware([{ access_token: ["event-user:cancelEventUser"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        eventId: {
          in: "path",
          name: "eventId",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "ICancelEventUserRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new EventsController();

      const promise = controller.cancelEventUser.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/events/:eventId/users/update-status",
    authenticateMiddleware([
      { access_token: ["event-user:updateEventUserStatus"] }
    ]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        eventId: {
          in: "path",
          name: "eventId",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IUpdateEventUserStatusRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new EventsController();

      const promise = controller.updateEventUserStatus.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/events/:eventId/cancel",
    authenticateMiddleware([{ access_token: ["event:cancelEvent"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        eventId: {
          in: "path",
          name: "eventId",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new EventsController();

      const promise = controller.cancelEvent.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/events/:eventId/complete",
    authenticateMiddleware([{ access_token: ["event:completeEvent"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        eventId: {
          in: "path",
          name: "eventId",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "ICompleteEventRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new EventsController();

      const promise = controller.completeEvent.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/events/:eventId/qrcode/:appName",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        eventId: {
          in: "path",
          name: "eventId",
          required: true,
          dataType: "string"
        },
        appName: {
          in: "path",
          name: "appName",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new EventsController();

      const promise = controller.getEventQrCode.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/events/:eventId/orders",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        eventId: {
          in: "path",
          name: "eventId",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new EventsController();

      const promise = controller.getEventOrders.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/events/:eventId/invite",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        eventId: {
          in: "path",
          name: "eventId",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IInviteUserRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new EventsController();

      const promise = controller.inviteUser.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/events/:scriptId/:shopId", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      req: { in: "request", name: "req", required: true, dataType: "object" },
      scriptId: {
        in: "path",
        name: "scriptId",
        required: true,
        dataType: "string"
      },
      shopId: {
        in: "path",
        name: "shopId",
        required: true,
        dataType: "string"
      },
      offset: { in: "query", name: "offset", dataType: "double" },
      limit: { in: "query", name: "limit", dataType: "double" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new EventsController();

    const promise = controller.getEventsByScriptAndShop.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/events/:scriptId/:shopId/discount-rules", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      scriptId: {
        in: "path",
        name: "scriptId",
        required: true,
        dataType: "string"
      },
      shopId: { in: "path", name: "shopId", required: true, dataType: "string" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new EventsController();

    const promise = controller.getEventDiscountRolesByScriptAndShop.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/events/:scriptId/:shopId/available-discount-rules", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      req: { in: "request", name: "req", required: true, dataType: "object" },
      scriptId: {
        in: "path",
        name: "scriptId",
        required: true,
        dataType: "string"
      },
      shopId: {
        in: "path",
        name: "shopId",
        required: true,
        dataType: "string"
      },
      startTime: { in: "query", name: "startTime", dataType: "string" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new EventsController();

    const promise = controller.getAvailableDiscountRules.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/games", function(request: any, response: any, next: any) {
    const args = {
      req: { in: "request", name: "req", required: true, dataType: "object" },
      limit: { in: "query", name: "limit", dataType: "double" },
      offset: { in: "query", name: "offset", dataType: "double" },
      keyword: { in: "query", name: "keyword", dataType: "string" },
      filterStr: { in: "query", name: "filter", dataType: "string" },
      sortStr: { in: "query", name: "sort", dataType: "string" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new GamesController();

    const promise = controller.getGames.apply(controller, validatedArgs as any);
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/games/:roomId/code/:code", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      roomId: {
        in: "path",
        name: "roomId",
        required: true,
        dataType: "string"
      },
      code: { in: "path", name: "code", required: true, dataType: "string" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new GamesController();

    const promise = controller.getGameScriptByRoomAndCode.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/games",
    authenticateMiddleware([{ access_token: ["game:addGame"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IAddGameRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new GamesController();

      const promise = controller.addGame.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/games/join",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IJoinGameRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new GamesController();

      const promise = controller.join.apply(controller, validatedArgs as any);
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/games/leave",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "ILeaveGameRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new GamesController();

      const promise = controller.leave.apply(controller, validatedArgs as any);
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/games/:gameId/script-rundown/:playerId",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        gameId: {
          in: "path",
          name: "gameId",
          required: true,
          dataType: "string"
        },
        playerId: {
          in: "path",
          name: "playerId",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new GamesController();

      const promise = controller.getScriptRundownByPlayer.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/games/:gameId/clues/:playerId",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        gameId: {
          in: "path",
          name: "gameId",
          required: true,
          dataType: "string"
        },
        playerId: {
          in: "path",
          name: "playerId",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new GamesController();

      const promise = controller.getGameScriptCluesByPlayer.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/games/:gameId/clues/:scriptClueId",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        gameId: {
          in: "path",
          name: "gameId",
          required: true,
          dataType: "string"
        },
        scriptClueId: {
          in: "path",
          name: "scriptClueId",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new GamesController();

      const promise = controller.updateGameScriptClue.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/games/:gameId",
    authenticateMiddleware([{ access_token: ["game:updateGame"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        gameId: {
          in: "path",
          name: "gameId",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IUpdateGameRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new GamesController();

      const promise = controller.updateGame.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.delete(
    "/games/:gameId",
    authenticateMiddleware([{ access_token: ["game:deleteGame"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        gameId: {
          in: "path",
          name: "gameId",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new GamesController();

      const promise = controller.deleteGame.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/members/available-member-card-types",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {};

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new MembersController();

      const promise = controller.getAvailableMemberCardTypes.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/members/batch-add-member-cards",
    authenticateMiddleware([
      { access_token: ["member:batchCreateMemberCards"] }
    ]),
    function(request: any, response: any, next: any) {
      const args = {
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IBatchCreateMemberCardsRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new MembersController();

      const promise = controller.batchCreateMemberCards.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/notifications",
    authenticateMiddleware([
      { access_token: ["notification:getNotifications"] }
    ]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        offset: { in: "query", name: "offset", dataType: "double" },
        limit: { in: "query", name: "limit", dataType: "double" },
        audience: { in: "query", name: "audience", dataType: "string" },
        eventType: { in: "query", name: "eventType", dataType: "string" },
        message: { in: "query", name: "message", dataType: "string" }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new NotificationsController();

      const promise = controller.getNotifications.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post("/notifications/sms-send-callback", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      body: {
        in: "body",
        name: "body",
        required: true,
        ref: "IGetSMSReportsRequest"
      }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new NotificationsController();

    const promise = controller.getSmsSendReports.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/notifications/:serialNumber",
    authenticateMiddleware([
      { access_token: ["notification:updateNotificationBySerialNumber"] }
    ]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        serialNumber: {
          in: "path",
          name: "serialNumber",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          dataType: "nestedObjectLiteral",
          nestedProperties: { read: { dataType: "boolean", required: true } }
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new NotificationsController();

      const promise = controller.updateNotification.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post("/notifications/qrcode-upload-callback", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      body: {
        in: "body",
        name: "body",
        required: true,
        dataType: "nestedObjectLiteral",
        nestedProperties: { data: { dataType: "any", required: true } }
      }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new NotificationsController();

    const promise = controller.getQrcodeUploadStatus.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/orders",
    authenticateMiddleware([{ access_token: ["order:getOrders"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        outTradeNo: { in: "query", name: "tradeNo", dataType: "string" },
        limit: { in: "query", name: "limit", dataType: "double" },
        offset: { in: "query", name: "offset", dataType: "double" }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new OrdersController();

      const promise = controller.getOrders.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/orders/:orderId/pay/:appName",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        orderId: {
          in: "path",
          name: "orderId",
          required: true,
          dataType: "string"
        },
        appName: {
          in: "path",
          name: "appName",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new OrdersController();

      const promise = controller.payOrder.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post("/orders/wechat/pay_callback", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      body: { in: "request", name: "body", required: true, dataType: "object" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new OrdersController();

    const promise = controller.confirmWechatPayment.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/orders/:orderId/pay-status/:appName",
    authenticateMiddleware([{ access_token: ["order:getOrderPaymentStatus"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        orderId: {
          in: "path",
          name: "orderId",
          required: true,
          dataType: "string"
        },
        appName: {
          in: "path",
          name: "appName",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new OrdersController();

      const promise = controller.queryPaymentStatus.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/orders/refund/:appName",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        appName: {
          in: "path",
          name: "appName",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new OrdersController();

      const promise = controller.refundOrders.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/orders/:orderId/refund",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        orderId: {
          in: "path",
          name: "orderId",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "ICreateRefundRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new OrdersController();

      const promise = controller.refundOrder.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post("/orders/wechat/refund_callback", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      body: { in: "body", name: "body", required: true, dataType: "any" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new OrdersController();

    const promise = controller.confirmWechatRefund.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/orders/:orderId/refund/:refundId",
    authenticateMiddleware([{ access_token: ["order:updateRefund"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        orderId: {
          in: "path",
          name: "orderId",
          required: true,
          dataType: "string"
        },
        refundId: {
          in: "path",
          name: "refundId",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IUpdateRefundRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new OrdersController();

      const promise = controller.updateRefund.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/prices/price-schema",
    authenticateMiddleware([
      { access_token: ["price-schema:createPriceSchema"] }
    ]),
    function(request: any, response: any, next: any) {
      const args = {
        body: { in: "body", name: "body", required: true, dataType: "any" }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new PricesController();

      const promise = controller.addPriceSchema.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/prices/discount-rules",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {};

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new PricesController();

      const promise = controller.getDiscountRules.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/prices/discount-rules",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IAddDiscountRuleRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new PricesController();

      const promise = controller.addDiscountRule.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/profile", authenticateMiddleware([{ access_token: [] }]), function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      req: { in: "request", name: "req", required: true, dataType: "object" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new ProfileController();

    const promise = controller.getMyProfile.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/profile/my-events",
    authenticateMiddleware([{ access_token: ["user:getMyEvents"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        status: { in: "query", name: "status", dataType: "string" }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new ProfileController();

      const promise = controller.getMyEvents.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/profile/token-status",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new ProfileController();

      const promise = controller.getTokenStatus.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/profile/wechat-data",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IGetWechatDataRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new ProfileController();

      const promise = controller.getPhoneEncryptedData.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/profile/my-games",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        statusStr: { in: "query", name: "status", dataType: "string" }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new ProfileController();

      const promise = controller.getMyGames.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/profile/my-online-scripts",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new ProfileController();

      const promise = controller.getMyOnlineScripts.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/profile/my-coupons",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        statusStr: {
          default: "active",
          in: "query",
          name: "status",
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new ProfileController();

      const promise = controller.getMyCoupons.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/profile/last-refundable-order",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new ProfileController();

      const promise = controller.getLastRefundableBooking.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/scripts", function(request: any, response: any, next: any) {
    const args = {
      req: { in: "request", name: "req", required: true, dataType: "object" },
      keyword: { in: "query", name: "keyword", dataType: "string" },
      offset: { in: "query", name: "offset", dataType: "double" },
      limit: { in: "query", name: "limit", dataType: "double" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new ScriptsController();

    const promise = controller.getScripts.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/scripts/feed", function(request: any, response: any, next: any) {
    const args = {
      discountKey: { in: "query", name: "discountKey", dataType: "string" },
      limit: { in: "query", name: "limit", dataType: "double" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new ScriptsController();

    const promise = controller.getScriptsFeed.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/scripts/:scriptId", function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      scriptId: {
        in: "path",
        name: "scriptId",
        required: true,
        dataType: "string"
      },
      extended: { in: "query", name: "extended", dataType: "string" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new ScriptsController();

    const promise = controller.getScript.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post("/scripts", function(request: any, response: any, next: any) {
    const args = {
      body: {
        in: "body",
        name: "body",
        required: true,
        ref: "IAddScriptRequest"
      }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new ScriptsController();

    const promise = controller.addScript.apply(
      controller,
      validatedArgs as any
    );
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/scripts/:scriptId/watch",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        scriptId: {
          in: "path",
          name: "scriptId",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new ScriptsController();

      const promise = controller.addToWatchList.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.delete(
    "/scripts/:scriptId/watch",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        scriptId: {
          in: "path",
          name: "scriptId",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new ScriptsController();

      const promise = controller.removeFromWatchList.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/shops", function(request: any, response: any, next: any) {
    const args = {
      req: { in: "request", name: "req", required: true, dataType: "object" },
      keyword: { in: "query", name: "keyword", dataType: "string" },
      offset: { in: "query", name: "offset", dataType: "double" },
      limit: { in: "query", name: "limit", dataType: "double" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new ShopsController();

    const promise = controller.getShops.apply(controller, validatedArgs as any);
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/shops/:shopId", function(request: any, response: any, next: any) {
    const args = {
      shopId: { in: "path", name: "shopId", required: true, dataType: "string" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new ShopsController();

    const promise = controller.getShop.apply(controller, validatedArgs as any);
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post("/shops", authenticateMiddleware([{ access_token: [] }]), function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {
      body: { in: "body", name: "body", required: true, ref: "IAddShopRequest" }
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new ShopsController();

    const promise = controller.addShop.apply(controller, validatedArgs as any);
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/shops/:shopId/script/:scriptId",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        shopId: {
          in: "path",
          name: "shopId",
          required: true,
          dataType: "string"
        },
        scriptId: {
          in: "path",
          name: "scriptId",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new ShopsController();

      const promise = controller.addScript.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get("/tags", authenticateMiddleware([{ access_token: [] }]), function(
    request: any,
    response: any,
    next: any
  ) {
    const args = {};

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    let validatedArgs: any[] = [];
    try {
      validatedArgs = getValidatedArgs(args, request);
    } catch (err) {
      return next(err);
    }

    const controller = new TagsController();

    const promise = controller.getTags.apply(controller, validatedArgs as any);
    promiseHandler(controller, promise, response, next);
  });
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/users/:userId",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        userId: {
          in: "path",
          name: "userId",
          required: true,
          dataType: "string"
        },
        req: { in: "request", name: "req", required: true, dataType: "object" }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new UsersController();

      const promise = controller.getUserDetails.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/users/:userId",
    authenticateMiddleware([{ access_token: ["user:updateUser"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        userId: {
          in: "path",
          name: "userId",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IUpdateUserRequest"
        },
        req: { in: "request", name: "req", required: true, dataType: "object" }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new UsersController();

      const promise = controller.updateUser.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/users/:userId/block",
    authenticateMiddleware([{ access_token: ["user:blockUserById"] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        userId: {
          in: "path",
          name: "userId",
          required: true,
          dataType: "string"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new UsersController();

      const promise = controller.blockUser.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/users/:userId/tag",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        userId: {
          in: "path",
          name: "userId",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IAddUserTagRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new UsersController();

      const promise = controller.addUserTag.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/users/:userId/subscribe-member",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        userId: {
          in: "path",
          name: "userId",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "ISubscribeMemberRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new UsersController();

      const promise = controller.subscribeMember.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/users/:userId/redeem-member-card",
    authenticateMiddleware([{ access_token: [] }]),
    function(request: any, response: any, next: any) {
      const args = {
        req: { in: "request", name: "req", required: true, dataType: "object" },
        userId: {
          in: "path",
          name: "userId",
          required: true,
          dataType: "string"
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          ref: "IRedeemMemberCardRequest"
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new UsersController();

      const promise = controller.redeemMemberCard.apply(
        controller,
        validatedArgs as any
      );
      promiseHandler(controller, promise, response, next);
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
    return (request: any, _response: any, next: any) => {
      let responded = 0;
      let success = false;

      const succeed = function(user: any) {
        if (!success) {
          success = true;
          responded++;
          request["user"] = user;
          next();
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      const fail = function(error: any) {
        responded++;
        if (responded == security.length && !success) {
          error.status = error.status || 401;
          next(error);
        }
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      for (const secMethod of security) {
        if (Object.keys(secMethod).length > 1) {
          let promises: Promise<any>[] = [];

          for (const name in secMethod) {
            promises.push(
              expressAuthentication(request, name, secMethod[name])
            );
          }

          Promise.all(promises)
            .then(users => {
              succeed(users[0]);
            })
            .catch(fail);
        } else {
          for (const name in secMethod) {
            expressAuthentication(request, name, secMethod[name])
              .then(succeed)
              .catch(fail);
          }
        }
      }
    };
  }

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  function isController(object: any): object is Controller {
    return (
      "getHeaders" in object && "getStatus" in object && "setStatus" in object
    );
  }

  function promiseHandler(
    controllerObj: any,
    promise: any,
    response: any,
    next: any
  ) {
    return Promise.resolve(promise)
      .then((data: any) => {
        let statusCode;
        if (isController(controllerObj)) {
          const headers = controllerObj.getHeaders();
          Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
          });

          statusCode = controllerObj.getStatus();
        }

        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

        if (
          data &&
          typeof data.pipe === "function" &&
          data.readable &&
          typeof data._read === "function"
        ) {
          data.pipe(response);
        } else if (data || data === false) {
          // === false allows boolean result
          response.status(statusCode || 200).json(data);
        } else {
          response.status(statusCode || 204).end();
        }
      })
      .catch((error: any) => next(error));
  }

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  function getValidatedArgs(args: any, request: any): any[] {
    const fieldErrors: FieldErrors = {};
    const values = Object.keys(args).map(key => {
      const name = args[key].name;
      switch (args[key].in) {
        case "request":
          return request;
        case "query":
          return validationService.ValidateParam(
            args[key],
            request.query[name],
            name,
            fieldErrors,
            undefined,
            { specVersion: 2 }
          );
        case "path":
          return validationService.ValidateParam(
            args[key],
            request.params[name],
            name,
            fieldErrors,
            undefined,
            { specVersion: 2 }
          );
        case "header":
          return validationService.ValidateParam(
            args[key],
            request.header(name),
            name,
            fieldErrors,
            undefined,
            { specVersion: 2 }
          );
        case "body":
          return validationService.ValidateParam(
            args[key],
            request.body,
            name,
            fieldErrors,
            name + ".",
            { specVersion: 2 }
          );
        case "body-prop":
          return validationService.ValidateParam(
            args[key],
            request.body[name],
            name,
            fieldErrors,
            "body.",
            { specVersion: 2 }
          );
      }
    });

    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidateError(fieldErrors, "");
    }
    return values;
  }

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
