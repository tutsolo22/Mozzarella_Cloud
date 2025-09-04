import { Location } from '../../locations/entities/location.entity';
export declare enum CostFrequency {
    OneTime = "one-time",
    Daily = "daily",
    Weekly = "weekly",
    Monthly = "monthly"
}
export declare class OverheadCost {
    id: string;
    tenantId: string;
    locationId: string;
    location: Location;
    name: string;
    description: string;
    amount: number;
    frequency: CostFrequency;
    costDate: Date;
    updatedAt: Date;
}
