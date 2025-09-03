import { IsInt, IsOptional, Min } from 'class-validator';

export class OptimizeRoutesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  maxOrdersPerDriver?: number;
}