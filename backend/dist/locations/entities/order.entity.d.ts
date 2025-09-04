import { Location } from '../../locations/entities/location.entity';
export declare class Order {
    id: string;
    location: Location;
    locationId: string;
    createdAt: Date;
    updatedAt: Date;
}
