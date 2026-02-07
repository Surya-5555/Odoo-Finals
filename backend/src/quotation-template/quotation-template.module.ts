import { Module } from '@nestjs/common';
import { QuotationTemplateService } from './quotation-template.service';
import { QuotationTemplateController } from './quotation-template.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [QuotationTemplateController],
  providers: [QuotationTemplateService, PrismaService],
  exports: [QuotationTemplateService],
})
export class QuotationTemplateModule {}
