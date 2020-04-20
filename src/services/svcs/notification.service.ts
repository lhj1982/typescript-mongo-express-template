import { INotificationModel } from '../../data/repositories/notification/notification.model';
import NotificationsRepo from '../../data/repositories/notification/notifications.repository';
import logger from '../../middleware/logger.middleware';
import { ResourceNotFoundException } from '../../exceptions/custom.exceptions';
import { string2Date } from '../../utils/dateUtil';
import { pp } from '../../utils/stringUtil';

class NotificationService {
  async getNotifications(params: any): Promise<any> {
    const { offset, limit, audience, eventType, message } = params;
    const result = await NotificationsRepo.find({
      offset,
      limit,
      audience,
      eventType,
      message
    });

    return result;
  }

  async updateSmsReport(reports: string[]): Promise<void> {
    const sendReports = this.generateSendReports(reports);
    // console.log(sendReports);
    let notification = undefined;
    let foundNotification = 0;
    if (sendReports) {
      for (let i = 0; i < sendReports.length; i++) {
        const report = sendReports[i];
        const { taskid } = report;
        notification = await NotificationsRepo.findByTaskId(taskid);
        if (notification) {
          foundNotification = 1;
          break;
        }
      }
      if (!foundNotification) {
        logger.warn(`No notification is found, taskid: ${pp(sendReports)}`);
      } else {
        const notificationToUpdate = Object.assign(notification.toObject(), {
          reports: sendReports
        });
        await NotificationsRepo.saveOrUpdate(notificationToUpdate);
        const { taskid } = notification;
        logger.info(`Update notification status succeed, taskid: ${taskid}`);
      }
    }
  }

  generateSendReports = (reports: string[]): any => {
    try {
      return reports
        .map(_ => {
          if (_) {
            const splittedReportItem = _.split(',');
            const taskid = splittedReportItem[0];
            const recipient = splittedReportItem[1];
            const statusCode = splittedReportItem[2];
            const status = splittedReportItem[3];
            const serialNumber = splittedReportItem[4];
            const sendDate = string2Date(splittedReportItem[5], true, 'YYYYMMDDHHmmss');
            return {
              taskid,
              recipient,
              statusCode,
              status,
              serialNumber,
              sendDate
            };
          } else {
            return null;
          }
        })
        .filter(_ => {
          return _ != null;
        });
    } catch (err) {
      logger.error(`${err.toString()}, stack: ${err.stack}`);
      return undefined;
    }
  };

  async updateNotificationBySerialNumber(serialNumber: string, params: any): Promise<INotificationModel> {
    const notification = await NotificationsRepo.findBySerialNumber(serialNumber);
    if (!notification) {
      throw new ResourceNotFoundException('Notification', serialNumber);
    }
    const notificationToUpdate = Object.assign(notification.toObject(), params);
    // delete notificationToUpdate._id;
    const resp = await NotificationsRepo.saveOrUpdate(notificationToUpdate);
    return resp;
  }
}

export default new NotificationService();
