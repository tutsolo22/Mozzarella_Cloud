import { IsEnum, IsNumberString, IsOptional } from 'class-validator';

export enum ForecastPeriod {
  Daily = 'daily',
  Weekly = 'weekly',
}

export class SalesForecastQueryDto {
  @IsEnum(ForecastPeriod)
  @IsOptional()
  period?: ForecastPeriod = ForecastPeriod.Weekly;

  @IsNumberString()
  @IsOptional()
  duration?: string = '4'; // e.g., predict for the next 4 weeks/days
}