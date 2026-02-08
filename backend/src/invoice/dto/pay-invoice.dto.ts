import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class PayInvoiceDto {
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;
}
