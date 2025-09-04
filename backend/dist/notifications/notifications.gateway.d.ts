import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { Server, Socket } from 'socket.io';
import { Order } from '../orders/entities/order.entity';
import { JwtService } from '@nestjs/jwt';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    server: Server;
    private activeDrivers;
    private readonly logger;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleDriverLocation(data: {
        lat: number;
        lng: number;
    }, client: Socket): void;
    sendNewDeliveryToDriver(driverId: string, order: Order): void;
    sendLocationUpdateToDriver(driverId: string, order: Order): void;
    sendNewOrderToKitchen(tenantId: string, order: Order): void;
    sendOrderReadyNotification(tenantId: string, order: Order): void;
    sendOrderAssigned(tenantId: string, order: Order): void;
    sendOrderPriorityUpdate(tenantId: string, order: Order): void;
    sendOrderStatusUpdate(tenantId: string, payload: {
        order: Order;
        previousStatus: OrderStatus;
        newStatus: OrderStatus;
    }): void;
    private sendActiveDriversList;
}
