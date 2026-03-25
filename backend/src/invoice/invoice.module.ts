import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
<<<<<<< HEAD
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceScheduler } from './invoice.scheduler';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, PrismaService, InvoiceScheduler],
=======

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService],
>>>>>>> 34d8f0563272fc3ffddc6ac63922119f2dfd0da5
  exports: [InvoiceService],
})
export class InvoiceModule {}
