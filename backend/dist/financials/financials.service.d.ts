import { Repository } from 'typeorm';
import { OverheadCost } from './entities/overhead-cost.entity';
import { CreateOverheadCostDto } from './dto/create-overhead-cost.dto';
import { UpdateOverheadCostDto } from './dto/update-overhead-cost.dto';
export declare class FinancialsService {
    private readonly costRepository;
    constructor(costRepository: Repository<OverheadCost>);
    create(createDto: CreateOverheadCostDto, tenantId: string, locationId: string): Promise<OverheadCost>;
    findAll(tenantId: string, startDate?: string, endDate?: string, locationId?: string): Promise<OverheadCost[]>;
    findAllForLocation(locationId: string, startDate: string, endDate: string): Promise<OverheadCost[]>;
    update(id: string, updateDto: UpdateOverheadCostDto, tenantId: string, locationId?: string): Promise<OverheadCost>;
    remove(id: string, tenantId: string, locationId?: string): Promise<void>;
}
