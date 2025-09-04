import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Product } from '../products/entities/product.entity';
import { Location } from '../locations/entities/location.entity';
export declare class PromotionsService {
    private readonly promotionRepository;
    private readonly productRepository;
    private readonly locationRepository;
    constructor(promotionRepository: Repository<Promotion>, productRepository: Repository<Product>, locationRepository: Repository<Location>);
    create(createDto: CreatePromotionDto, tenantId: string): Promise<Promotion>;
    findAll(tenantId: string): Promise<Promotion[]>;
    findOne(id: string, tenantId: string): Promise<Promotion>;
    update(id: string, updateDto: UpdatePromotionDto, tenantId: string): Promise<Promotion>;
    remove(id: string, tenantId: string): Promise<void>;
    findActiveByLocation(locationId: string): Promise<Promotion[]>;
}
