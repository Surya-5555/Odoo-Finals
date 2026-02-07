import { PartialType } from '@nestjs/mapped-types';
import { CreateQuotationTemplateDto } from './create-quotation-template.dto';

export class UpdateQuotationTemplateDto extends PartialType(
  CreateQuotationTemplateDto,
) {}
