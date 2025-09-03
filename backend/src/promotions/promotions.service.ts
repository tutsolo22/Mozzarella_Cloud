import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Product } from '../products/entities/product.entity';
import { Location } from '../locations/entities/location.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async create(createDto: CreatePromotionDto, tenantId: string): Promise<Promotion> {
    const { productIds, ...promotionData } = createDto;
    const products = await this.productRepository.findBy({ id: In(productIds), tenantId });

    const promotion = this.promotionRepository.create({
      ...promotionData,
      tenantId,
      products,
    });

    return this.promotionRepository.save(promotion);
  }

  findAll(tenantId: string): Promise<Promotion[]> {
    return this.promotionRepository.find({ where: { tenantId }, relations: ['products'] });
  }

  async findOne(id: string, tenantId: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({ where: { id, tenantId }, relations: ['products'] });
    if (!promotion) {
      throw new NotFoundException(`Promoción con ID "${id}" no encontrada.`);
    }
    return promotion;
  }

  async update(id: string, updateDto: UpdatePromotionDto, tenantId: string): Promise<Promotion> {
    const { productIds, ...promotionData } = updateDto;
    const promotion = await this.findOne(id, tenantId);

    if (productIds) {
      promotion.products = await this.productRepository.findBy({ id: In(productIds), tenantId });
    }

    Object.assign(promotion, promotionData);
    return this.promotionRepository.save(promotion);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.promotionRepository.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`Promoción con ID "${id}" no encontrada.`);
    }
  }

  async findActiveByLocation(locationId: string): Promise<Promotion[]> {
    const location = await this.locationRepository.findOneBy({ id: locationId });
    if (!location) {
      throw new NotFoundException(`Sucursal con ID "${locationId}" no encontrada.`);
    }

    const now = new Date();

    const promotions = await this.promotionRepository.find({
      where: {
        tenantId: location.tenantId,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      relations: ['products'],
      order: {
        endDate: 'ASC',
      },
    });

    return promotions.map(promo => ({
      ...promo,
      products: promo.products.filter(p => p.locationId === locationId && p.isAvailable && !p.deletedAt),
    })).filter(promo => promo.products.length > 0);
  }
}