import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { TenantConfiguration } from '../tenants/entities/tenant-configuration.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { HttpService } from '@nestjs/axios';
interface Location {
    lat: number;
    lng: number;
}
export declare class GeofencingService {
    private readonly orderRepository;
    private readonly tenantConfigRepository;
    private readonly notificationsGateway;
    private readonly httpService;
    private readonly logger;
    constructor(orderRepository: Repository<Order>, tenantConfigRepository: Repository<TenantConfiguration>, notificationsGateway: NotificationsGateway, httpService: HttpService);
    private getDistance;
    private getEta;
    checkDriverProximity(driverId: string, tenantId: string, driverLocation: Location): Promise<void>;
}
export {};
