import { IsDateString, IsOptional } from 'class-validator';

export class SalesReportQueryDto {
  @IsDateString()
  @IsOptional()
  startDate?: string; // Format: YYYY-MM-DD

  @IsDateString()
  @IsOptional()
  endDate?: string; // Format: YYYY-MM-DD
}