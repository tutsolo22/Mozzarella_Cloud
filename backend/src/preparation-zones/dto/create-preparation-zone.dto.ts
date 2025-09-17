import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePreparationZoneDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}