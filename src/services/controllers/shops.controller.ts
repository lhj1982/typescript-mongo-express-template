import { Route, Get, Post, SuccessResponse, Tags, Body, Path, Query, OperationId, Request, Response, Security } from 'tsoa';
import { IAddShopRequest } from '../requests';
import { IResponse, IErrorResponse } from '../responses';
import GenericController from './generic.controller';
import config from '../../config';
// import logger from '../../middleware/logger.middleware';

import ShopService from '../svcs/shop.service';
import ScriptService from '../svcs/script.service';
import { InvalidRequestException, ResourceNotFoundException } from '../../exceptions/custom.exceptions';

@Route('shops')
export class ShopsController extends GenericController {
  /**
   * List all shops.
   */
  @Get()
  @Tags('shop')
  @OperationId('listShops')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getShops(@Request() req: any, @Query() keyword?: string, @Query() offset?: number, @Query() limit?: number): Promise<IResponse> {
    try {
      // let offset = parseInt(req.query.offset);
      // let limit = parseInt(req.query.limit);
      // const { keyword } = req.query;
      if (!offset) {
        offset = config.query.offset;
      }
      if (!limit) {
        limit = config.query.limit;
      }

      let result = await ShopService.find({ keyword, offset, limit });
      const links = this.generateLinks(result.pagination, req.originalUrl, '');
      result = Object.assign({}, result, links);
      return { code: 'SUCCESS', data: result };
    } catch (err) {
      throw err;
    }
  }

  @Get('/{shopId}')
  @Tags('shop')
  @OperationId('listShops')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getShop(@Path('shopId') shopId: string): Promise<IResponse> {
    try {
      // const { shopId } = req.params;
      const shop = await ShopService.findById(shopId);
      if (!shop) {
        throw new ResourceNotFoundException('Shop', shopId);
      }
      return { code: 'SUCCESS', data: shop };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Add new shop.
   */
  @Post()
  @Tags('shop')
  @OperationId('AddShop')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async addShop(@Body() body: IAddShopRequest): Promise<IResponse> {
    const { key, name, address, mobile, phone, contactName, contactMobile, province, city, district, wechatId, wechatName } = body;
    try {
      const shopToAdd = {
        key,
        name,
        address,
        mobile,
        phone,
        wechatId,
        wechatName,
        contactName,
        contactMobile,
        province,
        city,
        district,
        createdAt: new Date()
      };

      const newShop = await ShopService.addShop(shopToAdd);
      return { code: 'SUCCESS', data: newShop };
    } catch (err) {
      throw err;
    }
  }

  @Post('/{shopId}/script/{scriptId}')
  @Tags('shop')
  @OperationId('addSingleShopScript')
  @Security('access_token')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async addScript(@Path('shopId') shopId: string, @Path('scriptId') scriptId: string): Promise<IResponse> {
    // const { scriptId, shopId } = req.params;
    if (!scriptId) {
      throw new InvalidRequestException('AddShopScript', ['scriptId']);
    }
    if (!shopId) {
      throw new InvalidRequestException('AddShopScript', ['shopId']);
    }
    const shop = await ShopService.findById(shopId);
    if (!shop) {
      throw new ResourceNotFoundException('Shop', shopId);
    }
    const script = await ScriptService.findById(scriptId);
    if (!script) {
      throw new ResourceNotFoundException('Script', scriptId);
    }
    const idstrArr = shop.scripts.map(_ => {
      return _.toString();
    });
    // only add script when it does not exist in shop
    if (idstrArr.indexOf(scriptId) === -1) {
      shop.scripts.push(script);
      const newShop = await ShopService.save(shop);
      return { code: 'SUCCESS', data: newShop };
    } else {
      return { code: 'SUCCESS', data: shop };
    }
  }
}
