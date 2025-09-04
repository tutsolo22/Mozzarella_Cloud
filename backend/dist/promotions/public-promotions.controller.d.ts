import { PromotionsService } from './promotions.service';
import { Promotion } from './entities/promotion.entity';
export declare class PublicPromotionsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    findActive(locationId: string): Promise<Promotion[]>;
}
