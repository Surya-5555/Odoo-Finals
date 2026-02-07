import { IsNumber, IsString, Min } from 'class-validator';

export class CreateProductVariantDto {
  @IsString()
  attribute: string;

  @IsString()
  value: string;

  @IsNumber()
  @Min(0)
  extraPrice: number;
}
