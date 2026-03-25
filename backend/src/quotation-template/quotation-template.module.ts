import { Module } from '@nestjs/common';
import { QuotationTemplateService } from './quotation-template.service';
import { QuotationTemplateController } from './quotation-template.controller';

@Module({
  controllers: [QuotationTemplateController],
  providers: [QuotationTemplateService],
  exports: [QuotationTemplateService],
})
export class QuotationTemplateModule {}
