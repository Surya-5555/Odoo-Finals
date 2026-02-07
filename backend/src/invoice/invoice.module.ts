import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceScheduler } from './invoice.scheduler';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, PrismaService, InvoiceScheduler],
  exports: [InvoiceService],
})
export class InvoiceModule {}
