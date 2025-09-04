import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './enums/order-status.enum';
import { InventoryMovementsService } from '../inventory-movements/inventory-movements.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { GeocodingService } from '../geocoding/geocoding.service';
import { Location } from '../locations/entities/location.entity';
import { SetPreparationTimeDto } from './dto/set-preparation-time.dto';
import { User } from '../users/entities/user.entity';
import { PaymentMethod } from './enums/order-types.enum';
import { PaymentsService } from '../payments/payments.service';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly ingredientRepository;
    private readonly productRepository;
    private readonly userRepository;
    private readonly locationRepository;
    private readonly inventoryMovementsService;
    private readonly notificationsGateway;
    private readonly notificationsService;
    private readonly geocodingService;
    private readonly dataSource;
    private readonly paymentsService;
    private readonly logger;
    constructor(orderRepository: Repository<Order>, ingredientRepository: Repository<Ingredient>, productRepository: Repository<Product>, userRepository: Repository<User>, locationRepository: Repository<Location>, inventoryMovementsService: InventoryMovementsService, notificationsGateway: NotificationsGateway, notificationsService: NotificationsService, geocodingService: GeocodingService, dataSource: DataSource, paymentsService: PaymentsService);
    create(createOrderDto: CreateOrderDto, tenantId: string, locationId: string, userId?: string, initialStatus?: OrderStatus): Promise<Order>;
    confirmOrderPayment(orderId: string, paymentGatewayId: string): Promise<Order>;
    findAll(tenantId: string, locationId?: string): Promise<Order[]>;
    findByStatus(statuses: OrderStatus[], tenantId: string, locationId: string): Promise<Order[]>;
    findOrdersBetween(tenantId: string, locationId: string, startDate: Date, endDate: Date, statuses: OrderStatus[]): Promise<Order[]>;
    getOrderCountsByStatus(options: {
        tenantId?: string;
        locationId?: string;
    }, forDate?: Date): Promise<{
        confirmed: number;
        in_preparation: number;
        in_delivery: number;
        delivered: number;
    }>;
    getDriverPerformanceReport(tenantId: string, locationId: string, startDate?: string, endDate?: string): Promise<{
        driverId: any;
        driverName: any;
        totalDeliveries: number;
        totalAmountCollected: number;
        averageDeliveryTimeMinutes: string;
    }[]>;
    getDriverSettlementData(tenantId: string, locationId: string, startDate: Date, endDate: Date): Promise<{
        driverId: string;
        driverName: string;
        orders: {
            shortId: string;
            totalAmount: number;
            paymentMethod: PaymentMethod;
            deliveredAt: Date | null;
        }[];
        totalCollected: number;
        cashCollected: number;
    }[]>;
    findOne(id: string, tenantId: string, locationId?: string): Promise<Order>;
    update(id: string, updateOrderDto: UpdateOrderDto, tenantId: string, locationId?: string): Promise<Order>;
    updateStatus(id: string, status: OrderStatus, tenantId: string, locationId?: string): Promise<Order>;
    updatePriority(id: string, isPriority: boolean, tenantId: string, locationId?: string): Promise<Order>;
    assignDriver(orderId: string, driverId: string, tenantId: string, locationId: string): Promise<Order>;
    setPreparationTime(id: string, tenantId: string, locationId: string, setPreparationTimeDto: SetPreparationTimeDto): Promise<Order>;
    updateCoordinates(orderId: string, latitude: number, longitude: number, tenantId: string, locationId?: string): Promise<Order>;
    private isPointInDeliveryArea;
    getSalesReport(tenantId: string, locationId: string, startDate?: string, endDate?: string): Promise<{
        reportPeriod: {
            from: string;
            to: string;
        };
        totalOrders: number;
        totalRevenue: number;
        productsBreakdown: {
            productName: string;
            quantitySold: number;
            totalRevenue: number;
            productId: string;
        }[];
    }>;
    getIngredientConsumptionReport(tenantId: string, locationId: string, startDate?: string, endDate?: string): Promise<{
        reportPeriod: {
            from: string;
            to: string;
        };
        consumedIngredients: {
            ingredientName: string;
            unit: string;
            totalConsumed: number;
            ingredientId: string;
        }[];
    }>;
    getProfitabilityReport(tenantId: string, locationId: string): Promise<{
        productId: string;
        productName: string;
        sellingPrice: number;
        ingredientsCost: number;
        profit: number;
        margin: number;
    }[]>;
}
