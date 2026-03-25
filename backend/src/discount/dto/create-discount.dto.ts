import {
  IsBoolean,
  IsDateString,
<<<<<<< HEAD
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
=======
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  percent: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsBoolean()
  limitUsage?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  productId?: number;
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
}
