import { HttpService } from '@nestjs/axios';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
interface Point {
    lat: number;
    lng: number;
}
export declare class RouteOptimizationService {
    private readonly httpService;
    private readonly logger;
    constructor(httpService: HttpService);
    private getDistance;
    private getTravelTimeMatrix;
    optimizeRoutes(orders: Order[], drivers: User[], constraints: {
        maxOrdersPerDriver: number;
    }, restaurantLocation: Point, directionsApiKey?: string): Promise<{
        driverId: any;
        driverName: any;
        orders: any;
        orderCount: any;
        estimatedDistanceKm: any;
        estimatedDurationMinutes: number;
        currentWeightKg: any;
        maxWeightKg: any;
        currentVolumeM3: any;
        maxVolumeM3: any;
    }[]>;
    private optimizeRoutesByTravelTime;
    private optimizeRoutesByDistance;
    private checkCapacity;
    private formatRoutes;
}
export {};
