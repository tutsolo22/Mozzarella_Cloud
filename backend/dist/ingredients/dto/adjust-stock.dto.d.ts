export declare class AdjustStockItemDto {
    ingredientId: string;
    newQuantity: number;
    reason: string;
}
export declare class AdjustStockDto {
    items: AdjustStockItemDto[];
}
