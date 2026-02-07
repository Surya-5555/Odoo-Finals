import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRecurringPlanPriceDto } from './create-recurring-plan-price.dto';

export class CreateRecurringPlanDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  minQuantity?: number = 1;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  autoClose?: boolean = false;

  @IsOptional()
  @IsInt()
  @Min(1)
  autoCloseValidityDays?: number;

  @IsOptional()
  @IsBoolean()
  pausable?: boolean = true;

  @IsOptional()
  @IsBoolean()
  renewable?: boolean = true;

  @IsOptional()
  @IsBoolean()
  closable?: boolean = true;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecurringPlanPriceDto)
  prices?: CreateRecurringPlanPriceDto[];
}
