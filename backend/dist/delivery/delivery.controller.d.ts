import { UserPayload } from '../auth/decorators/user.decorator';
import { RouteOptimizationService } from './services/route-optimization.service';
import { OptimizeRoutesDto } from './dto/optimize-routes.dto';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
export declare class DeliveryController {
    private readonly routeOptimizationService;
    private readonly usersService;
    private readonly ordersService;
    private readonly tenantsService;
    constructor(routeOptimizationService: RouteOptimizationService, usersService: UsersService, ordersService: OrdersService, tenantsService: TenantsService);
    optimizeRoutes(optimizeRoutesDto: OptimizeRoutesDto, user: UserPayload): Promise<{
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
}
