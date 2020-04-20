import { Document } from 'mongoose';

interface INotification {
  key: string;
  taskid: string;
  eventType: string;
  audience: string;
  objectId: string;
  message: string;
  smsMessage: string;
  recipients: string[];
  serialNumber: string;
  status: string;
  result: string;
  description: string;
  error: string;
  createdAt: Date;
  read: boolean;
  reports: any[];
}

export interface INotificationModel extends INotification, Document {}
