import { Module } from '@nestjs/common';
import { RecurringPlanService } from './recurring-plan.service';
import { RecurringPlanController } from './recurring-plan.controller';

@Module({
  controllers: [RecurringPlanController],
  providers: [RecurringPlanService],
  exports: [RecurringPlanService],
})
export class RecurringPlanModule {}
