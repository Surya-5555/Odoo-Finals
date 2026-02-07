import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSubscriptionLineDto } from './create-subscription-line.dto';

export class CreateSubscriptionDto {
  @IsInt()
  contactId: number;

  @IsInt()
  recurringPlanId: number;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsInt()
  quotationTemplateId?: number;

  @IsOptional()
  @IsDateString()
  orderDate?: string;

  @IsOptional()
  @IsInt()
  paymentTermId?: number;

  @IsOptional()
  @IsInt()
  salespersonId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubscriptionLineDto)
  lines?: CreateSubscriptionLineDto[];
}
