import { IsNumber, IsEnum, IsBoolean, IsOptional, Min } from 'class-validator';
import { BillingPeriodUnit } from '@prisma/client';

export class CreateRecurringPlanPriceDto {
  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  billingPeriodValue: number;

  @IsEnum(BillingPeriodUnit)
  billingPeriodUnit: BillingPeriodUnit;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
