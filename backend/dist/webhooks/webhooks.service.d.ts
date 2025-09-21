import { OrdersService } from '../orders/orders.service';
import { InvoiceWebhookPayload } from './dto/invoice-webhook.dto';
export declare class WebhooksService {
    private readonly ordersService;
    private readonly logger;
    constructor(ordersService: OrdersService);
    processInvoicingWebhook(tenantId: string, payload: InvoiceWebhookPayload): Promise<void>;
}
