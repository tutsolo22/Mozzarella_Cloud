import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SalesForecastQueryDto } from './dto/sales-forecast-query.dto';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto): Promise<import("./entities/order.entity").Order>;
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
        orders: import("./entities/order.entity").Order[];
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
    findAll(): Promise<import("./entities/order.entity").Order[]>;
    findOne(id: string): Promise<import("./entities/order.entity").Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<import("./entities/order.entity").Order>;
    remove(id: string): Promise<void>;
}
