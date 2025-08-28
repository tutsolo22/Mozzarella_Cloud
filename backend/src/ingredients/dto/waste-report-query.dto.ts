import { IsDateString, IsOptional } from 'class-validator';

export class WasteReportQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}