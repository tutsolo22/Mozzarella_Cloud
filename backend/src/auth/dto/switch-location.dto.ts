import { IsUUID } from 'class-validator';

export class SwitchLocationDto {
  @IsUUID('4')
  locationId: string;
}