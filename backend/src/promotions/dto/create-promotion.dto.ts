import { IsString, IsNotEmpty, IsDateString, IsArray, IsUUID } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @IsUUID('4', { each: true })
  productIds: string[];
}