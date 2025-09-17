import { Repository } from 'typeorm';
import { PreparationZone } from './entities/preparation-zone.entity';
import { CreatePreparationZoneDto } from './dto/create-preparation-zone.dto';
import { UpdatePreparationZoneDto } from './dto/update-preparation-zone.dto';
import { Product } from '../products/entities/product.entity';
export declare class PreparationZonesService {
    private readonly zoneRepository;
    private readonly productRepository;
    constructor(zoneRepository: Repository<PreparationZone>, productRepository: Repository<Product>);
    create(dto: CreatePreparationZoneDto, tenantId: string, locationId: string): Promise<PreparationZone>;
    findAll(tenantId: string, locationId: string): Promise<PreparationZone[]>;
    findOne(id: string, tenantId: string, locationId: string): Promise<PreparationZone>;
    update(id: string, dto: UpdatePreparationZoneDto, tenantId: string, locationId: string): Promise<PreparationZone>;
    remove(id: string, tenantId: string, locationId: string): Promise<void>;
}
