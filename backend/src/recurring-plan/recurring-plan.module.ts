import { Module } from '@nestjs/common';
import { RecurringPlanService } from './recurring-plan.service';
import { RecurringPlanController } from './recurring-plan.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [RecurringPlanController],
  providers: [RecurringPlanService, PrismaService],
  exports: [RecurringPlanService],
})
export class RecurringPlanModule {}
