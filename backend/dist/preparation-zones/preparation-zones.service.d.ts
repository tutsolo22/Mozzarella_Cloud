import { Repository } from 'typeorm';
import { PreparationZone } from './entities/preparation-zone.entity';
import { CreatePreparationZoneDto } from './dto/create-preparation-zone.dto';
import { UpdatePreparationZoneDto } from './dto/update-preparation-zone.dto';
import { Product } from '../products/entities/product.entity';
export declare class PreparationZonesService {
    private readonly zoneRepository;
    private readonly productRepository;
    constructor(zoneRepository: Repository<PreparationZone>, productRepository: Repository<Product>);
    create(createDto: CreatePreparationZoneDto, tenantId: string, locationId: string): Promise<any>;
    findAll(tenantId: string, locationId: string): Promise<PreparationZone[]>;
    findOne(id: string, tenantId: string, locationId: string): Promise<PreparationZone>;
    update(id: string, updateDto: UpdatePreparationZoneDto, tenantId: string, locationId: string): Promise<any>;
    remove(id: string, tenantId: string, locationId: string): Promise<void>;
}
