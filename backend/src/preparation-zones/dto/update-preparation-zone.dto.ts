import { PartialType } from '@nestjs/mapped-types';
import { CreatePreparationZoneDto } from './create-preparation-zone.dto';

export class UpdatePreparationZoneDto extends PartialType(CreatePreparationZoneDto) {}