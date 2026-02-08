import { IsEnum, IsOptional, IsString, Max, Min, IsNumber } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class PortalCheckoutDto {
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  discountCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsString()
  address?: string;
}
