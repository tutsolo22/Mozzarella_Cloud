import { Location } from '../../locations/entities/location.entity';
export declare class Tenant {
    id: string;
    name: string;
    locations: Location[];
    createdAt: Date;
    updatedAt: Date;
}
