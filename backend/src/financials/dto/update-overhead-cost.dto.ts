import { PartialType } from '@nestjs/mapped-types';
import { CreateOverheadCostDto } from './create-overhead-cost.dto';

export class UpdateOverheadCostDto extends PartialType(CreateOverheadCostDto) {}