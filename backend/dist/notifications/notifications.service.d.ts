import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { UsersService } from '../users/users.service';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
export declare class NotificationsService {
    private readonly notificationRepository;
    private readonly usersService;
    constructor(notificationRepository: Repository<Notification>, usersService: UsersService);
    createLowStockNotification(ingredient: Ingredient, tenantId: string): Promise<void>;
    findAllForUser(userId: string): Promise<Notification[]>;
    markAsRead(id: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
}
