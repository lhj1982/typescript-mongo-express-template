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
import { ProfileController } from "./services/controllers/profile.controller";
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
      data: { dataType: "string" }
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
      nickName: { dataType: "string", required: true },
      avatarUrl: { dataType: "string", required: true },
      gender: { dataType: "string", required: true },
      encryptedData: { dataType: "string", required: true },
      iv: { dataType: "string", required: true },
      country: { dataType: "string", required: true },
      province: { dataType: "string", required: true },
      city: { dataType: "string", required: true },
      language: { dataType: "string", required: true },
      description: { dataType: "string", required: true }
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
  IUpdateUserRequest: {
    dataType: "refObject",
    properties: {
      nickName: { dataType: "string", required: true },
      gender: { dataType: "string", required: true },
      description: { dataType: "string", required: true },
      city: { dataType: "string", required: true },
      email: { dataType: "string", required: true },
      mobile: { dataType: "string", required: true },
      wechatId: { dataType: "string", required: true },
      company: { dataType: "string", required: true },
      avatarImage: { dataType: "string", required: true },
      ageTag: {
        dataType: "array",
        array: { dataType: "string" },
        required: true
      }
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
