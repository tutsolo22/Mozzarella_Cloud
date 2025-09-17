import { PreparationZonesService } from './preparation-zones.service';
import { CreatePreparationZoneDto } from './dto/create-preparation-zone.dto';
import { UpdatePreparationZoneDto } from './dto/update-preparation-zone.dto';
import { UserPayload } from '../auth/decorators/user.decorator';
export declare class PreparationZonesController {
    private readonly zonesService;
    constructor(zonesService: PreparationZonesService);
    private ensureLocationSelected;
    create(createDto: CreatePreparationZoneDto, user: UserPayload): Promise<import("./entities/preparation-zone.entity").PreparationZone>;
    findAll(user: UserPayload): Promise<import("./entities/preparation-zone.entity").PreparationZone[]>;
    update(id: string, updateDto: UpdatePreparationZoneDto, user: UserPayload): Promise<import("./entities/preparation-zone.entity").PreparationZone>;
    remove(id: string, user: UserPayload): Promise<void>;
}
