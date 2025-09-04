import { NotificationsService } from './notifications.service';
import { UserPayload } from '../auth/decorators/user.decorator';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(user: UserPayload): Promise<import("./entities/notification.entity").Notification[]>;
    markAsRead(id: string, user: UserPayload): Promise<void>;
    markAllAsRead(user: UserPayload): Promise<void>;
}
