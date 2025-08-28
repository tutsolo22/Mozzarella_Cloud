import { IsJWT, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class ValidateLicenseDto {
  @IsNotEmpty()
  @IsJWT()
  licenseKey: string;

  @IsOptional()
  @IsUUID()
  localTenantId?: string; // El ID del tenant almacenado en la instalación local
}