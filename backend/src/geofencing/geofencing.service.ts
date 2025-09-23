import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { TenantConfiguration } from '../tenant-configuration/entities/tenant-configuration.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface Location {
  lat: number;
  lng: number;
}

const PROXIMITY_THRESHOLD_KM = 0.5; // 500 meters

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

  // Haversine formula to calculate distance between two points
  private getDistance(p1: Location, p2: Location): number {
    const R = 6371; // Radius of the Earth in km
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

  private async getEta(start: Location, end: Location, apiKey: string): Promise<number | null> {
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
      const durationInSeconds = response.data.routes[0]?.summary?.duration;
      return durationInSeconds ? Math.ceil(durationInSeconds / 60) : null; // Return ETA in minutes
    } catch (error) {
      this.logger.error('Error al obtener ETA de OpenRouteService', error.response?.data);
      return null;
    }
  }

  async checkDriverProximity(driverId: string, tenantId: string, driverLocation: Location): Promise<void> {
    const tenantConfig = await this.tenantConfigRepository.findOneBy({ tenantId });
    if (!tenantConfig?.restaurantLatitude || !tenantConfig?.restaurantLongitude) {
      return; // No restaurant location configured
    }

    const restaurantLocation: Location = {
      lat: tenantConfig.restaurantLatitude,
      lng: tenantConfig.restaurantLongitude,
    };

    const distance = this.getDistance(driverLocation, restaurantLocation);

    if (distance <= PROXIMITY_THRESHOLD_KM) {
      const ordersToNotify = await this.orderRepository.find({
        where: {
          assignedDriverId: driverId,
          status: OrderStatus.InDelivery,
          pickupNotificationSent: false, // Only notify once
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
      }
    }
  }
}