import { Route, Get, Post, SuccessResponse, Tags, Body, OperationId, Response, Security } from 'tsoa';
import { IAddDiscountRuleRequest } from '../requests';
import { IResponse, IErrorResponse } from '../responses';
// import config from '../../config';

import GenericController from './generic.controller';
import ScriptsRepo from '../../data/repositories/script/scripts.repository';
// import UsersRepo from '../../data/repositories/user/users.repository';
import ShopsRepo from '../../data/repositories/shop/shops.repository';
import PricesRepo from '../../data/repositories/price/prices.repository';
import { ResourceNotFoundException } from '../../exceptions/custom.exceptions';

@Route('prices')
export class PricesController extends GenericController {
  /**
   * Create price schmea.
   *
   * @param {[type]} '/price-schema' [description]
   */
  @Post('/price-schema')
  @Tags('price-schema')
  @OperationId('createPriceSchema')
  @Security('access_token', ['price-schema:createPriceSchema'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async addPriceSchema(@Body() body: any): Promise<IResponse> {
    const { shopId, scriptId, priceSchema } = body;
    try {
      const script = await ScriptsRepo.findById(scriptId);
      const shop = await ShopsRepo.findById(shopId);
      if (!script) {
        throw new ResourceNotFoundException('Script', scriptId);
      }
      if (!shop) {
        throw new ResourceNotFoundException('Shop', shopId);
      }
      // const priceWeeklySchema = await PricesRepo.findByShopAndScript(shopId, scriptId);
      const priceWeeklySchemaToUpdate = {
        script: scriptId,
        shop: shopId,
        priceSchema
      };
      // if (priceWeeklySchema) {
      //   priceWeeklySchemaToUpdate = _.merge(priceWeeklySchema, { priceSchema }); // Object.assign({}, ...priceWeeklySchema);
      //   console.log(priceWeeklySchemaToUpdate);
      //   // priceWeeklySchemaToUpdate['priceSchema'] = priceSchema;
      // } else {
      //   priceWeeklySchemaToUpdate = {
      //     shop: shopId,
      //     script: scriptId,
      //     priceSchema: priceSchema
      //   };
      // }
      console.log(priceWeeklySchemaToUpdate);
      const newPriceWeeklySchema = await PricesRepo.saveOrUpdatePriceSchema(priceWeeklySchemaToUpdate);
      return { code: 'SUCCESS', data: newPriceWeeklySchema };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Retrieve available discount rules.
   *
   * @param {[type]} '/discount-rules' [description]
   */
  @Get('/discount-rules')
  @Tags('price-schema')
  @OperationId('getDiscountRules')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getDiscountRules(): Promise<IResponse> {
    const discountRules = await PricesRepo.findDiscountRules();
    return { code: 'SUCCESS', data: discountRules };
  }

  /**
   * Add new discount rule.
   *
   * @param {[type]} '/discount-rules' [description]
   */
  @Post('/discount-rules')
  @Tags('price-schema')
  @OperationId('AddDiscountRule')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async addDiscountRule(@Body() body: IAddDiscountRuleRequest): Promise<IResponse> {
    const { key, description, timeDescription, timeSpan, days, discount } = body;
    const discountRule = await PricesRepo.saveOrUpdateDiscountRule({
      key,
      description,
      timeDescription,
      timeSpan,
      days,
      discount
    });
    return { code: 'SUCCESS', data: discountRule };
  }
}
