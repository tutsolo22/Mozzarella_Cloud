import { CostFrequency } from '../entities/overhead-cost.entity';
export declare class CreateOverheadCostDto {
    name: string;
    description?: string;
    amount: number;
    frequency: CostFrequency;
    costDate: string;
}
