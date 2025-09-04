import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  create(
    createLocationDto: CreateLocationDto,
    tenantId: string,
  ): Promise<Location> {
    const location = this.locationRepository.create({
      ...createLocationDto,
      tenantId,
    });
    return this.locationRepository.save(location);
  }

  findAll(tenantId: string, includeInactive: boolean = false): Promise<Location[]> {
    return this.locationRepository.find({
      where: { tenantId },
      withDeleted: includeInactive,
    });
  }

  async findOne(id: string, tenantId: string): Promise<Location> {
    const location = await this.locationRepository.findOneBy({ id, tenantId });
    if (!location) {
      throw new NotFoundException(`Sucursal con ID "${id}" no encontrada.`);
    }
    return location;
  }

  async update(
    id: string,
    tenantId: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.locationRepository.preload({
      id,
      ...updateLocationDto,
    });

    if (!location || location.tenantId !== tenantId) {
      throw new NotFoundException(`Sucursal con ID "${id}" no encontrada.`);
    }

    return this.locationRepository.save(location);
  }

  async disable(id: string, tenantId: string): Promise<void> {
    const location = await this.findOne(id, tenantId); // Ensures it exists and is active

    const activeOrderCount = await this.orderRepository.count({
      where: {
        locationId: id,
        status: In([
          OrderStatus.PendingConfirmation,
          OrderStatus.Confirmed,
          OrderStatus.InPreparation,
          OrderStatus.ReadyForDelivery,
          OrderStatus.ReadyForExternalPickup,
          OrderStatus.InDelivery,
        ]),
      },
    });

    if (activeOrderCount > 0) {
      throw new ConflictException(
        `No se puede deshabilitar la sucursal porque tiene ${activeOrderCount} pedidos activos. Por favor, complete o cancele todos los pedidos antes de deshabilitarla.`,
      );
    }

    const result = await this.locationRepository.softDelete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`Sucursal con ID "${id}" no encontrada.`);
    }
  }

  async enable(id: string, tenantId: string): Promise<void> {
    await this.locationRepository.restore({ id, tenantId });
  }
}