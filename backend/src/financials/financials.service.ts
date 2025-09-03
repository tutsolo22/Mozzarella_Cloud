import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { OverheadCost } from './entities/overhead-cost.entity';
import { CreateOverheadCostDto } from './dto/create-overhead-cost.dto';
import { UpdateOverheadCostDto } from './dto/update-overhead-cost.dto';

@Injectable()
export class FinancialsService {
  constructor(
    @InjectRepository(OverheadCost)
    private readonly costRepository: Repository<OverheadCost>,
  ) {}

  create(createDto: CreateOverheadCostDto, tenantId: string, locationId: string): Promise<OverheadCost> {
    const cost = this.costRepository.create({ ...createDto, tenantId, locationId });
    return this.costRepository.save(cost);
  }

  findAll(tenantId: string, startDate?: string, endDate?: string, locationId?: string): Promise<OverheadCost[]> {
    const whereClause: FindOptionsWhere<OverheadCost> = { tenantId };
    if (locationId) {
      whereClause.locationId = locationId;
    }
    if (startDate && endDate) {
      const toDate = new Date(endDate);
      toDate.setDate(toDate.getDate() + 1);
      whereClause.costDate = Between(new Date(startDate), toDate);
    }
    return this.costRepository.find({ where: whereClause, order: { costDate: 'DESC' } });
  }

  // This is the specific method for the P&L report
  findAllForLocation(locationId: string, startDate: string, endDate: string): Promise<OverheadCost[]> {
    const toDate = new Date(endDate);
    toDate.setDate(toDate.getDate() + 1);
    return this.costRepository.find({
      where: {
        locationId,
        costDate: Between(new Date(startDate), toDate),
      },
    });
  }

  async update(id: string, updateDto: UpdateOverheadCostDto, tenantId: string, locationId?: string): Promise<OverheadCost> {
    const where: FindOptionsWhere<OverheadCost> = { id, tenantId };
    if (locationId) {
      where.locationId = locationId;
    }
    const existingCost = await this.costRepository.findOneBy(where);
    if (!existingCost) {
      throw new NotFoundException(`Costo con ID "${id}" no encontrado o no pertenece a tu sucursal.`);
    }

    const cost = await this.costRepository.preload({ id, ...updateDto });
    return this.costRepository.save(cost);
  }

  async remove(id: string, tenantId: string, locationId?: string): Promise<void> {
    const where: FindOptionsWhere<OverheadCost> = { id, tenantId };
    if (locationId) {
      where.locationId = locationId;
    }
    const result = await this.costRepository.delete(where);
    if (result.affected === 0) {
      throw new NotFoundException(`Costo con ID "${id}" no encontrado o no pertenece a tu sucursal.`);
    }
  }
}