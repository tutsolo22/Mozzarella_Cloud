declare class OperationItemDto {
    ingredientId: string;
    quantity: number;
    reason?: string;
}
export declare class PurchaseIngredientsDto {
    items: OperationItemDto[];
}
export declare class RegisterWasteDto extends PurchaseIngredientsDto {
}
declare class AdjustmentItemDto {
    ingredientId: string;
    quantity: number;
    reason: string;
}
export declare class AdjustStockDto {
    items: AdjustmentItemDto[];
}
export {};
