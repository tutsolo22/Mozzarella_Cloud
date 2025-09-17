import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreparationZone } from './entities/preparation-zone.entity';
import { CreatePreparationZoneDto } from './dto/create-preparation-zone.dto';
import { UpdatePreparationZoneDto } from './dto/update-preparation-zone.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class PreparationZonesService {
  constructor(
    @InjectRepository(PreparationZone)
    private readonly zoneRepository: Repository<PreparationZone>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(dto: CreatePreparationZoneDto, tenantId: string, locationId: string): Promise<PreparationZone> {
    const zone = this.zoneRepository.create({ ...dto, tenantId, locationId });
    return this.zoneRepository.save(zone);
  }

  findAll(tenantId: string, locationId: string): Promise<PreparationZone[]> {
    return this.zoneRepository.find({ where: { tenantId, locationId }, order: { name: 'ASC' } });
  }

  async findOne(id: string, tenantId: string, locationId: string): Promise<PreparationZone> {
    const zone = await this.zoneRepository.findOneBy({ id, tenantId, locationId });
    if (!zone) {
      throw new NotFoundException(`Zona de preparación con ID #${id} no encontrada.`);
    }
    return zone;
  }

  async update(id: string, dto: UpdatePreparationZoneDto, tenantId: string, locationId: string): Promise<PreparationZone> {
    const zone = await this.findOne(id, tenantId, locationId);
    Object.assign(zone, dto);
    return this.zoneRepository.save(zone);
  }

  async remove(id: string, tenantId: string, locationId: string): Promise<void> {
    const zone = await this.findOne(id, tenantId, locationId);

    const productsInZone = await this.productRepository.count({
      where: { preparationZoneId: id, tenantId },
    });

    if (productsInZone > 0) {
      throw new ConflictException(`No se puede eliminar la zona porque está asignada a ${productsInZone} producto(s).`);
    }

    await this.zoneRepository.remove(zone);
  }
}