import * as express from 'express';
import { AuthorizationException, AccessDeniedException } from '../exceptions/custom.exceptions';
import config from '../config';
import { IUserModel } from '../data/repositories/user/user.model';
import UserService from '../services/svcs/user.service';
import logger from './logger.middleware';
import * as jwt from 'jsonwebtoken';

/**
 * If any of requested permission is not found in allowedPermissions, return false, otherwise, return true
 * @type {[type]}
 */
const matchPermission = (requestedPermissions, allowedPermissions): boolean => {
  // console.log(requestedPermissions);
  // console.log(allowedPermissions);
  for (let i = 0; i < requestedPermissions.length; i++) {
    const requestedPermission = requestedPermissions[i];
    if (allowedPermissions.indexOf(requestedPermission) !== -1) {
      return true;
    }
  }
  return false;
};

// /**
//  * Normalize permission data into a flat array
//  * Example indata
//  * [ { domain: 'user', operations: [ 'read' ] },
// { domain: 'event', operations: [ 'read' ] } ]

//  * @type {[type]}
//  */
// const normalizePermissions = data => {
//   const result = [];
//   for (let i = 0; i < data.length; i++) {
//     const permission = data[i];
//     const { domain, operations } = permission;
//     for (let j = 0; j < operations.length; j++) {
//       result.push(domain + '_' + operations[j]);
//     }
//   }
//   return result;
// };

const isAllowed = (claimedPermissions, allowedPermissions: any[]): boolean => {
  // const requestedPermissions = normalizePermissions(claimedPermissions);
  return matchPermission(claimedPermissions, allowedPermissions);
};

const getAllowedPermissions = (roles: any[]): string[] => {
  try {
    const result = [];

    for (let i = 0; i < roles.length; i++) {
      const permissions = roles[i].permissions;
      for (let j = 0; j < permissions.length; j++) {
        result.push(permissions[j]);
      }
    }
    const allowedPermissions = [];
    for (let i = 0; i < result.length; i++) {
      const permission = result[i];
      const { domain, operations } = permission;
      for (let j = 0; j < operations.length; j++) {
        allowedPermissions.push(domain + ':' + operations[j]);
      }
    }
    return allowedPermissions;
  } catch (err) {
    console.error(err);
  }
};

async function expressAuthentication(req: express.Request, securityName: string, scopes?: string[]): Promise<any> {
  // console.log(scopes);
  if (securityName === 'access_token') {
    return new Promise((resolve, reject) => {
      if (!req.headers.authorization) {
        reject(new AuthorizationException(`${req.headers.authorization}`));
        // return res.status(401).end();
      }
      // get the last part from a authorization header string like "bearer token-value"
      const token = req.headers.authorization.split(' ')[1];
      // decode the token using a secret key-phrase
      jwt.verify(token, (config as any).jwt.secret, async (err, decoded) => {
        // the 401 code is for unauthorized status
        if (err) {
          logger.error(`Error when verify token, ${err}`);
          reject(new AuthorizationException(`${token}`));
        } else {
          const { sub: userId, iat: issuedAt, exp: expiredAt } = decoded;
          // console.log(decoded);
          // check if a user exists
          // res.locals.tokenIssuedAt = issuedAt;
          // res.locals.tokenExpiredAt = expiredAt;
          // req.issuedAt = issuedAt;
          // req.expiredAt = expiredAt;
          try {
            // const user = undefined;
            const user: IUserModel = await UserService.findById(userId);
            if (!user) {
              reject(new AccessDeniedException(userId, `User is not found`));
            }
            const { status, roles } = user;
            if (status === 'blocked') {
              reject(new AccessDeniedException(userId, `User is blocked`));
            }
            if (status != 'active') {
              reject(new AccessDeniedException(userId, `User is not active`));
              return;
            }
            // further check permissions if provided
            if (scopes && scopes.length > 0) {
              const allowedPermissions = getAllowedPermissions(roles);
              if (user && isAllowed(scopes, allowedPermissions)) {
                resolve(user);
              } else {
                logger.warn(`User ${userId} is not allowed to perform action ${scopes}`);
                reject(new AccessDeniedException(userId, `Forbidden`));
              }
            }
            // res.locals.loggedInUser = user;
            resolve(
              Object.assign(user, {
                tokenIssuedAt: issuedAt,
                tokenExpiredAt: expiredAt
              })
            );
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  }
}

export { expressAuthentication };
