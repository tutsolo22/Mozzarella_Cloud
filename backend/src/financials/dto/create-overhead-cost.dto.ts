import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { CostFrequency } from '../entities/overhead-cost.entity';

export class CreateOverheadCostDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(CostFrequency)
  frequency: CostFrequency;

  @IsDateString()
  costDate: string;
}