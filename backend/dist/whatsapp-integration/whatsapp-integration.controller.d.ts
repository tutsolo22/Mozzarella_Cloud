import { WhatsappIntegrationService } from './whatsapp-integration.service';
import { CreateWhatsappOrderDto } from './dto/create-whatsapp-order.dto';
export declare class WhatsappIntegrationController {
    private readonly integrationService;
    constructor(integrationService: WhatsappIntegrationService);
    handleIncomingOrder(createWhatsappOrderDto: CreateWhatsappOrderDto, req: any): Promise<{
        message: string;
        paymentLink: string;
        orderId: string;
        totalAmount?: undefined;
        estimatedReadyAt?: undefined;
    } | {
        message: string;
        orderId: string;
        totalAmount: number;
        estimatedReadyAt: Date;
        paymentLink?: undefined;
    }>;
}
