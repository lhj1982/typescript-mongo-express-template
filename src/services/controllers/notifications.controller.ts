import { Route, Path, Query, Post, Get, Put, SuccessResponse, Tags, Body, OperationId, Request, Response, Security } from 'tsoa';
import { IGetSMSReportsRequest } from '../requests';
import { IResponse, IErrorResponse } from '../responses';
import logger from '../../middleware/logger.middleware';
import config from '../../config';

import GenericController from './generic.controller';
// import NotificationsRepo from '../repositories/notifications.repository';
import NotificationService from '../svcs/notification.service';

@Route('notifications')
export class NotificationsController extends GenericController {
  /**
   * Retrieve notifications list. Required permission: notifications.read.
   *
   */
  @Get()
  @Tags('notification')
  @OperationId('getNotifications')
  @Security('access_token', ['notification:getNotifications'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getNotifications(
    @Request() req: any,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
    @Query('audience') audience?: string,
    @Query('eventType') eventType?: string,
    @Query('message') message?: string
  ): Promise<IResponse> {
    try {
      // let offset = parseInt(req.query.offset);
      // let limit = parseInt(req.query.limit);
      // const audience = req.query.audience;
      // const eventType = req.query.eventType;
      // const message = req.query.message;
      let query = `audience=${audience}`;
      if (eventType) {
        query += `&eventType=${eventType}`;
      }
      if (message) {
        query += `&weChat=${message}`;
      }
      if (!offset) {
        offset = config.query.offset;
      }
      if (!limit) {
        limit = config.query.limit;
      }
      // const { user: loggedInUser } = req;

      let result = await NotificationService.getNotifications({
        offset,
        limit,
        audience,
        eventType,
        message
      });
      const links = this.generateLinks(result.pagination, req.originalUrl, query);
      result = Object.assign({}, result, links);
      return { code: 'SUCCESS', data: result };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Retrieve sms notification send report.
   * report example is
   * reports=180828100924138386,13912345678,0, DELIVRD, 00000020140805135416, 20181125112640; 180828100924138386,13912345678,0, DELIVRD, 00000020140805135416, 20181125112640
   *
   * @param {Request}      req  [description]
   * @param {Response}     res  [description]
   * @param {NextFunction} next [description]
   */
  @Post('/sms-send-callback')
  @Tags('notification')
  @OperationId('smsSendCallback')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getSmsSendReports(@Body() body: IGetSMSReportsRequest): Promise<IResponse> {
    const { reports } = body;
    logger.info(`Receive message status report, data: ${reports}`);
    try {
      const reportsItems = reports.split(';');
      await NotificationService.updateSmsReport(reportsItems);
      return { code: 'SUCCESS', data: undefined };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update notification by serialNumber. Required permission: notification.update.
   *
   * @param {[type]} '/{serialNumber}' [description]
   */
  @Put('/{serialNumber}')
  @Tags('notification')
  @OperationId('updateNotificationBySerialNumber')
  @Security('access_token', ['notification:updateNotificationBySerialNumber'])
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async updateNotification(@Request() req: any, @Path('serialNumber') serialNumber: string, @Body() body: { read: boolean }): Promise<IResponse> {
    // const { serialNumber } = req.params;
    const { read } = body;
    try {
      const notificationToUpdate = await NotificationService.updateNotificationBySerialNumber(serialNumber, { read });
      return { code: 'SUCCESS', data: notificationToUpdate };
    } catch (err) {
      throw err;
    }
  }

  /**
   *
   * @summary status callback when upload image to qiniu cloud
   * @param {object} body callback data
   */
  @Post('/qrcode-upload-callback')
  @Tags('notification')
  @OperationId('qrCodeUploadCallback')
  @Response<IErrorResponse>('400', 'Bad Request')
  @SuccessResponse('200', 'OK')
  public async getQrcodeUploadStatus(@Body() body: { data: any }): Promise<IResponse> {
    const { data } = body;
    logger.info(`QRcode upload callback, ${data}`);
    return { code: 'SUCCESS', data: undefined };
  }
}
