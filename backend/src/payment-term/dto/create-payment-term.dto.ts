import { IsString, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePaymentTermDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  dueAfterDays: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  earlyDiscountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  earlyDiscountFixed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  earlyDiscountDays?: number;
}
