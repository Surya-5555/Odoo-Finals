import { IsString, IsOptional } from 'class-validator';

export class CreateQuotationTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  content?: string;
}
