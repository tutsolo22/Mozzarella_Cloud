declare class StockAdjustmentItemDto {
    ingredientId: string;
    newQuantity: number;
    reason: string;
}
export declare class AdjustStockDto {
    items: StockAdjustmentItemDto[];
}
export {};
