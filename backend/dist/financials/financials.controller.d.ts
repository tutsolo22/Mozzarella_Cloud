import { FinancialsService } from './financials.service';
import { CreateOverheadCostDto } from './dto/create-overhead-cost.dto';
import { UpdateOverheadCostDto } from './dto/update-overhead-cost.dto';
import { UserPayload } from '../auth/decorators/user.decorator';
export declare class FinancialsController {
    private readonly financialsService;
    constructor(financialsService: FinancialsService);
    create(createDto: CreateOverheadCostDto, user: UserPayload): Promise<import("./entities/overhead-cost.entity").OverheadCost>;
    findAll(user: UserPayload, startDate?: string, endDate?: string, locationId?: string): Promise<import("./entities/overhead-cost.entity").OverheadCost[]>;
    update(id: string, updateDto: UpdateOverheadCostDto, user: UserPayload): Promise<import("./entities/overhead-cost.entity").OverheadCost>;
    remove(id: string, user: UserPayload): Promise<void>;
}
