import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';

export class HexaFactWebhookDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string; // El ID del tenant en nuestro sistema (Mozzarella)

  @IsUrl()
  @IsNotEmpty()
  invoicingAppUrl: string; // La URL del portal de facturación que nos devuelve HexaFact
}