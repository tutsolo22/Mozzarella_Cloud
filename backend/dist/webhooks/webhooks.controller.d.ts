import { WebhooksService } from './webhooks.service';
import { InvoiceWebhookPayload } from './dto/invoice-webhook.dto';
import { Request } from 'express';
interface RequestWithTenant extends Request {
    tenantId: string;
}
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    handleInvoicingWebhook(payload: InvoiceWebhookPayload, req: RequestWithTenant): Promise<{
        received: boolean;
    }>;
}
export {};
