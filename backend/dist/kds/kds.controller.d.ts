import { KdsService } from './kds.service';
import { UserPayload } from '../auth/decorators/user.decorator';
export declare class KdsController {
    private readonly kdsService;
    constructor(kdsService: KdsService);
    getActiveOrdersForZone(user: UserPayload, zoneId: string): Promise<import("../orders/entities/order.entity").Order[]>;
}
