import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DiscountAppliesTo, DiscountType } from '@prisma/client';

export class CreateDiscountDto {
  @IsString()
  name: string;

  @IsEnum(DiscountType)
  type: DiscountType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  percent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fixed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchase?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  limitUsage?: number;

  @IsEnum(DiscountAppliesTo)
  appliesTo: DiscountAppliesTo;

  @IsOptional()
  @IsInt()
  productId?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
