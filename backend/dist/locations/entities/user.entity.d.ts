import { Location } from '../../locations/entities/location.entity';
export declare class User {
    id: string;
    email: string;
    fullName: string;
    location: Location;
    locationId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
