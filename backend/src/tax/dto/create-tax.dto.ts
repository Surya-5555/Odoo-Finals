<<<<<<< HEAD
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTaxDto {
  @IsString()
=======
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateTaxDto {
  @IsString()
  @IsNotEmpty()
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
  name: string;

  @IsNumber()
  @Min(0)
<<<<<<< HEAD
  percentage: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
=======
  @Max(100)
  percent: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
}
