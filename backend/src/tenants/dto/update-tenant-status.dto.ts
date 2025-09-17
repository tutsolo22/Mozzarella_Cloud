import { IsEnum } from 'class-validator';
import { TenantStatus } from '../entities/tenant.entity';

export class UpdateTenantStatusDto {
  @IsEnum(TenantStatus)
  status: TenantStatus;
}