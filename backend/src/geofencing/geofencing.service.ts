import { Injectable, forwardRef, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { TenantConfiguration } from '../tenants/entities/tenant-configuration.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface Point {
  lat: number;
  lng: number;
}

const PROXIMITY_THRESHOLD_KM = 0.5; // 500 metros

@Injectable()
export class GeofencingService {
  private readonly logger = new Logger(GeofencingService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(TenantConfiguration)
    private readonly tenantConfigRepository: Repository<TenantConfiguration>,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationsGateway: NotificationsGateway,
    private readonly httpService: HttpService,
  ) {}

  private getDistance(p1: Point, p2: Point): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private async getEta(
    start: Point,
    end: Point,
    apiKey: string,
  ): Promise<number | null> {
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car';
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            coordinates: [[start.lng, start.lat], [end.lng, end.lat]],
          },
          { headers: { Authorization: apiKey } },
        ),
      );
      // La API devuelve la duración en segundos
      const durationInSeconds = response.data.routes[0]?.summary?.duration;
      // Convertimos a minutos, redondeando hacia arriba
      return durationInSeconds ? Math.ceil(durationInSeconds / 60) : null;
    } catch (error) {
      this.logger.error('Error al obtener ETA de OpenRouteService', error.response?.data);
      return null;
    }
  }

  async checkDriverProximity(
    driverId: string,
    tenantId: string,
    driverLocation: Point,
  ): Promise<void> {
    const tenantConfig = await this.tenantConfigRepository.findOneBy({ tenantId });

    if (!tenantConfig?.restaurantLatitude || !tenantConfig?.restaurantLongitude) {
      return; // No se puede verificar si no hay ubicación del restaurante
    }

    const restaurantLocation: Point = {
      lat: tenantConfig.restaurantLatitude,
      lng: tenantConfig.restaurantLongitude,
    };

    const distance = this.getDistance(driverLocation, restaurantLocation);

    if (distance <= PROXIMITY_THRESHOLD_KM) {
      const ordersToNotify = await this.orderRepository.find({
        where: {
          assignedDriverId: driverId,
          status: OrderStatus.InDelivery,
          pickupNotificationSent: false,
        },
      });

      if (ordersToNotify.length === 0) return;

      const etaMinutes = tenantConfig.directionsApiKey
        ? await this.getEta(driverLocation, restaurantLocation, tenantConfig.directionsApiKey)
        : null;

      for (const order of ordersToNotify) {
        order.pickupNotificationSent = true;
        if (etaMinutes !== null) {
          const arrivalTime = new Date();
          arrivalTime.setMinutes(arrivalTime.getMinutes() + etaMinutes);
          order.estimatedPickupArrivalAt = arrivalTime;
        }
        await this.orderRepository.save(order);
        // TODO: Implement sendDriverApproachingNotification in NotificationsGateway
        // this.notificationsGateway.sendDriverApproachingNotification(tenantId, order, etaMinutes);
      }
    }
  }
}