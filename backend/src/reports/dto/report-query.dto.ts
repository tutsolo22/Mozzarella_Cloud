import { IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';

export class ReportQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string; // For TenantAdmins to filter by a specific location
}