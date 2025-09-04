import { NotificationType } from '../enums/notification-type.enum';
export declare class Notification {
    id: string;
    tenantId: string;
    userId: string;
    type: NotificationType;
    message: string;
    isRead: boolean;
    relatedEntityId: string;
    createdAt: Date;
}
