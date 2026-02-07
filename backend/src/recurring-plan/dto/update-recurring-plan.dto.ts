import { PartialType } from '@nestjs/mapped-types';
import { CreateRecurringPlanDto } from './create-recurring-plan.dto';

export class UpdateRecurringPlanDto extends PartialType(CreateRecurringPlanDto) {}
