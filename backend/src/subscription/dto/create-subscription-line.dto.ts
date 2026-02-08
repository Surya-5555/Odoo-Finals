import { IsNumber, IsOptional, Min, IsInt } from 'class-validator';

export class CreateSubscriptionLineDto {
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
