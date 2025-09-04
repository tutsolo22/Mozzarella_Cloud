import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly logger;
    constructor(paymentsService: PaymentsService);
    handleMercadoPagoWebhook(req: any, type: string, body: any): Promise<void>;
}
