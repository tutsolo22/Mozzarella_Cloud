export declare class CreatePromotionDto {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    discountPercentage?: number;
    isActive?: boolean;
    productIds: string[];
    imageUrl?: string;
}
