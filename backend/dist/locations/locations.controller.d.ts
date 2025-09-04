import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UserPayload } from '../auth/decorators/user.decorator';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    create(createLocationDto: CreateLocationDto, user: UserPayload): Promise<import("./entities/location.entity").Location>;
    findAll(user: UserPayload, includeInactive?: string): Promise<import("./entities/location.entity").Location[]>;
    update(id: string, updateLocationDto: UpdateLocationDto, user: UserPayload): Promise<import("./entities/location.entity").Location>;
    disable(id: string, user: UserPayload): Promise<void>;
    enable(id: string, user: UserPayload): Promise<void>;
}
