import { IsEnum, IsNotEmpty } from 'class-validator';
import { TenantStatus } from '../../tenants/enums/tenant-status.enum';

export class UpdateTenantStatusDto {
  @IsNotEmpty()
  @IsEnum(TenantStatus)
  status: TenantStatus;
}