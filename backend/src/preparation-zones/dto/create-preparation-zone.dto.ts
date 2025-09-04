import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreatePreparationZoneDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;
}

