import { UserPayload } from '../auth/decorators/user.decorator';
import { KdsService } from './kds.service';
export declare class KdsController {
    private readonly kdsService;
    constructor(kdsService: KdsService);
    findAll(user: UserPayload): Promise<import("../orders/entities/order.entity").Order[]>;
    findByZone(zoneId: string, user: UserPayload): Promise<import("../orders/entities/order.entity").Order[]>;
}
