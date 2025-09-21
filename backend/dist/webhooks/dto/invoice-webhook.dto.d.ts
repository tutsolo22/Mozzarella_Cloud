export declare enum InvoiceWebhookStatus {
    INVOICED = "invoiced",
    CANCELLED = "cancelled",
    ERROR = "error"
}
export declare class InvoiceWebhookPayload {
    internalOrderId: string;
    externalOrderId: string;
    status: InvoiceWebhookStatus;
    invoiceUrl?: string;
}
