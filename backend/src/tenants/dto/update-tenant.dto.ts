import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}