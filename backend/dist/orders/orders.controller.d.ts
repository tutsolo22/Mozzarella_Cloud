import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserPayload } from '../auth/decorators/user.decorator';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './enums/order-status.enum';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, user: UserPayload): Promise<import("./entities/order.entity").Order>;
    findAll(user: UserPayload, locationId?: string): Promise<import("./entities/order.entity").Order[]>;
    findOne(id: string, user: UserPayload): Promise<import("./entities/order.entity").Order>;
    update(id: string, updateOrderDto: UpdateOrderDto, user: UserPayload): Promise<import("./entities/order.entity").Order>;
    updateStatus(id: string, { status }: {
        status: OrderStatus;
    }, user: UserPayload): Promise<import("./entities/order.entity").Order>;
}
