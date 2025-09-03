import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OverheadCost } from './entities/overhead-cost.entity';
import { FinancialsService } from './financials.service';
import { FinancialsController } from './financials.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OverheadCost])],
  controllers: [FinancialsController],
  providers: [FinancialsService],
  exports: [FinancialsService],
})
export class FinancialsModule {}