import { PreparationZonesService } from './preparation-zones.service';
import { CreatePreparationZoneDto } from './dto/create-preparation-zone.dto';
import { UpdatePreparationZoneDto } from './dto/update-preparation-zone.dto';
import { UserPayload } from '../auth/decorators/user.decorator';
export declare class PreparationZonesController {
    private readonly zonesService;
    constructor(zonesService: PreparationZonesService);
    create(createDto: CreatePreparationZoneDto, user: UserPayload): Promise<any>;
    findAll(user: UserPayload): Promise<PreparationZone[]>;
    findOne(id: string, user: UserPayload): Promise<PreparationZone>;
    update(id: string, updateDto: UpdatePreparationZoneDto, user: UserPayload): Promise<any>;
    remove(id: string, user: UserPayload): Promise<void>;
}
