import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Order } from '../orders/entities/order.entity';
export declare class LocationsService {
    private readonly locationRepository;
    private readonly orderRepository;
    constructor(locationRepository: Repository<Location>, orderRepository: Repository<Order>);
    create(createLocationDto: CreateLocationDto, tenantId: string): Promise<Location>;
    findAll(tenantId: string, includeInactive?: boolean): Promise<Location[]>;
    findOne(id: string, tenantId: string): Promise<Location>;
    update(id: string, tenantId: string, updateLocationDto: UpdateLocationDto): Promise<Location>;
    disable(id: string, tenantId: string): Promise<void>;
    enable(id: string, tenantId: string): Promise<void>;
}
