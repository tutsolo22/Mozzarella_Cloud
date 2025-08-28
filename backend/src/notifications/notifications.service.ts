import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { UsersService } from '../users/users.service';
import { RoleEnum } from '../roles/enums/role.enum';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { NotificationType } from './enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly usersService: UsersService,
  ) {}

  async createLowStockNotification(ingredient: Ingredient, tenantId: string): Promise<void> {
    // Check if there's an existing, unread, recent notification for this ingredient to avoid spam
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingNotification = await this.notificationRepository.findOne({
      where: {
        tenantId,
        relatedEntityId: ingredient.id,
        type: NotificationType.LowStock,
        isRead: false,
        createdAt: MoreThan(twentyFourHoursAgo),
      },
    });

    if (existingNotification) {
      return; // A recent, unread notification already exists.
    }

    // Find all admins and managers for this tenant
    const usersToNotify = await this.usersService.findByRoles(
      [RoleEnum.Admin, RoleEnum.Manager],
      tenantId,
    );

    if (usersToNotify.length === 0) return;

    const message = `El ingrediente "${ingredient.name}" tiene stock bajo (${ingredient.stockQuantity} ${ingredient.unit}).`;

    const notifications = usersToNotify.map((user) => {
      return this.notificationRepository.create({
        tenantId,
        userId: user.id,
        message,
        type: NotificationType.LowStock,
        relatedEntityId: ingredient.id,
      });
    });

    await this.notificationRepository.save(notifications);
  }

  findAllForUser(userId: string) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50, // Limit to the last 50 notifications
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationRepository.update({ id, userId }, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update({ userId, isRead: false }, { isRead: true });
  }
}