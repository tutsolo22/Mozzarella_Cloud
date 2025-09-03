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

  create(createDto: CreatePreparationZoneDto, tenantId: string, locationId: string) {
    const zone = this.zoneRepository.create({ ...createDto, tenantId, locationId });
    return this.zoneRepository.save(zone);
  }

  findAll(tenantId: string, locationId: string) {
    return this.zoneRepository.find({ where: { tenantId, locationId }, order: { name: 'ASC' } });
  }

  async findOne(id: string, tenantId: string, locationId: string) {
    const zone = await this.zoneRepository.findOneBy({ id, tenantId, locationId });
    if (!zone) {
      throw new NotFoundException(`Zona de preparación con ID "${id}" no encontrada.`);
    }
    return zone;
  }

  async update(id: string, updateDto: UpdatePreparationZoneDto, tenantId: string, locationId: string) {
    await this.findOne(id, tenantId, locationId);
    const zone = await this.zoneRepository.preload({ id, ...updateDto });
    return this.zoneRepository.save(zone);
  }

  async remove(id: string, tenantId: string, locationId: string) {
    const zone = await this.findOne(id, tenantId, locationId);

    const productCount = await this.productRepository.count({
      where: { preparationZoneId: id, locationId },
    });

    if (productCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la zona "${zone.name}" porque tiene ${productCount} productos asociados.`,
      );
    }

    const result = await this.zoneRepository.delete({ id, tenantId, locationId });
    if (result.affected === 0) {
      throw new NotFoundException(`Zona de preparación con ID "${id}" no encontrada.`);
    }
  }
}