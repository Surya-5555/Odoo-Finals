import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpsellLineDto {
  @IsInt()
  productId: number;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercent?: number;
}

export class UpsellSubscriptionDto {
  @IsOptional()
  @IsInt()
  recurringPlanId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsellLineDto)
  lines: UpsellLineDto[];
}
