declare class WasteItemDto {
    ingredientId: string;
    quantity: number;
    reason?: string;
}
export declare class RegisterWasteDto {
    items: WasteItemDto[];
}
export {};
