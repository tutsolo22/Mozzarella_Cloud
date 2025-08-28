import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { InventoryMovementsService } from 'src/inventory-movements/inventory-movements.service';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import { SalesForecastQueryDto } from './dto/sales-forecast-query.dto';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly customerRepository;
    private readonly productRepository;
    private readonly userRepository;
    private readonly ingredientRepository;
    private readonly inventoryMovementsService;
    private readonly dataSource;
    constructor(orderRepository: Repository<Order>, customerRepository: Repository<Customer>, productRepository: Repository<Product>, userRepository: Repository<User>, ingredientRepository: Repository<Ingredient>, inventoryMovementsService: InventoryMovementsService, dataSource: DataSource);
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    remove(id: string): Promise<void>;
    private generateShortId;
    getSalesReport(queryDto: SalesReportQueryDto): Promise<{
        reportPeriod: {
            from: string;
            to: string;
        };
        totalOrders: number;
        totalRevenue: number;
        productsBreakdown: {
            totalRevenue: number;
            productName: string;
            quantitySold: number;
            productId: string;
        }[];
        orders: Order[];
    }>;
    getIngredientConsumptionReport(queryDto: SalesReportQueryDto): Promise<{
        reportPeriod: {
            from: string;
            to: string;
        };
        consumedIngredients: {
            totalConsumed: number;
            ingredientName: string;
            unit: string;
            ingredientId: string;
        }[];
    }>;
    getSalesForecast(queryDto: SalesForecastQueryDto): Promise<{
        predictionModel: string;
        parameters: {
            period: import("./dto/sales-forecast-query.dto").ForecastPeriod;
            windowSize: number;
            predictionDuration: number;
        };
        historicalDataUsed: {
            period: string;
            revenue: number;
        }[];
        forecast: any[];
    }>;
}
